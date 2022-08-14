/* eslint-disable react-hooks/exhaustive-deps */
import {
    Signer,
    CLPublicKey,
    CLValueBuilder,
    decodeBase16,
    CasperServiceByJsonRPC,
    CLValueParsers,
    CLMap,
    CLAccountHash,
  } from "casper-js-sdk";
  import { ERC20SignerClient } from "./clients/erc20signer-client";
  import useNetworkStatus from "../store/useNetworkStatus";
  import { BigNumber, BigNumberish } from "ethers";
  import {
    CHAIN_NAME,
    MASTER_CHEF_CONTRACT_HASH,
    NODE_ADDRESS,
    TRANSFER_FEE,
  } from "./config/constant";
  import { useEffect } from "react";
  
  // import useWalletStatus from "../store/useWalletStatus";
  import { amountWithoutDecimals, getDeploy } from "../utils/utils";
  import { Token } from "../config/interface/token";
  import { MasterChefClient } from "./clients/master-chef-client";
  import { VestingClient } from "./clients/vesting-client";
import { vestingContractAddress } from "../config";

  export default function useCasperWeb3Provider() {
    const { setActiveAddress, activeAddress, isConnected } = useNetworkStatus();
  
    // const { addAccount } = useWalletStatus();
  
    async function activate(requireConnection = true): Promise<void> {
      try {
        if (!!activeAddress && activeAddress !== "") return;
        let publicKey = await Signer.getActivePublicKey();
        setActiveAddress(publicKey);
        // addAccount(publicKey);
      } catch (err: any | Error) {
        if (requireConnection) {
          Signer.sendConnectionRequest();
        }
        // console.error(err);
      }
    }
  
    async function disconnect() {
      if(!!activeAddress && activeAddress !== "") {
        Signer.disconnectFromSite();
      }
    }
  
    async function totalVestingAmount(contractHash: string) {
      try
      {
        let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
        await vestingManager.setContractHash(contractHash);
        let tva = BigNumber.from(await vestingManager.totalVestingAmount());
        return tva;
      }
      catch(error){
        console.log("totalVestingAmount exception : ", error);
      }
    }

    async function allowanceOf(contractHash: string, spender: string, activeAddress:string) {
      let allowance;
      try {
        const erc20 = new ERC20SignerClient(NODE_ADDRESS, CHAIN_NAME, undefined);
        await erc20.setContractHash(contractHash);      
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const userHash = new CLAccountHash(clPubKey.toAccountHash());
        allowance = await erc20.allowances(
          userHash,
          CLValueBuilder.byteArray(decodeBase16(spender))
        );
      } catch (error) {
        console.log("allowanceOf exception : ", error);
        return 0;
      }
      return allowance;
    }
  
    async function balanceOf(contractHash: string, activeAddress:string) {

      let balance;
      try {
        const erc20 = new ERC20SignerClient(NODE_ADDRESS, CHAIN_NAME, undefined);
        await erc20.setContractHash(contractHash);
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const userHash = new CLAccountHash(clPubKey.toAccountHash());
        balance = await erc20.balanceOf(userHash);
      } catch (error) {
        console.log("balanceOf exception : ", error);
        return 0;
      }
      return balance;
    }
  
    async function approve(amount: BigNumberish, tokenAddress: string, spender: string, activeAddress:string) {
      let txHash = "";
      try {
        const erc20 = new ERC20SignerClient(NODE_ADDRESS, CHAIN_NAME, undefined);
        await erc20.setContractHash(tokenAddress);
        const clPK = CLPublicKey.fromHex(activeAddress);
        txHash = await erc20.approveWithSigner(
          clPK,
          amount,
          CLValueBuilder.byteArray(decodeBase16(spender)),
          TRANSFER_FEE
        );
        console.log("approving trx : ", txHash);
      } catch (error) {
        console.log("approve exception : ", error);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash);
        console.log("approved, ", txHash);
        return txHash;
      } catch (error) {
        console.log("failed approve : ", error);
        return txHash;
      }
    }
  
    async function getCSPRBalance(activeAddress:string) {
      const client = new CasperServiceByJsonRPC(NODE_ADDRESS);
      let stateRootHash = await client.getStateRootHash();
      let accountBalance = BigNumber.from(0);
      try {
        let accountBalanceUref = await client.getAccountBalanceUrefByPublicKey(stateRootHash, CLPublicKey.fromHex(activeAddress));
        accountBalance = await client.getAccountBalance(stateRootHash, accountBalanceUref);
      } catch(error) {
      }
      return amountWithoutDecimals(BigNumber.from(accountBalance), 9);
    }
    
    async function getContractHashFromPackage(packageHash: string, activeAddress:string) {
      const client = new CasperServiceByJsonRPC(NODE_ADDRESS);
          const { block } = await client.getLatestBlockInfo();
  
      if (block) {
        const stateRootHash = block.header.state_root_hash;
        const blockState = await client.getBlockState(
          stateRootHash,
          `hash-${packageHash}`,
          []
        );
        let contractHash =
          blockState.ContractPackage?.versions[
            blockState.ContractPackage.versions.length - 1
          ].contractHash.slice(9)!;
        return contractHash;
      }
    }
      
    async function vest(cliff_amount: BigNumberish, cliff_duration: BigNumberish, activeAddress:string) {
      console.log("vest () ");

      let txHash;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {        
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const userHash = new CLAccountHash(clPubKey.toAccountHash());
        
        txHash = await vestingManager.vest(userHash, cliff_amount.toString(), cliff_duration.toString(), clPubKey.toAccountHashStr(), TRANSFER_FEE);
      } catch (err) {
        console.log("vest exception1 : ", err);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        // toast.success("Deposit");
        return txHash;
      } catch (error) {
        return txHash;
      }
    }
  
    async function withdraw(farm: {}, amount: BigNumberish, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      setPending(true);
      let txHash;
      let masterChef = new MasterChefClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await masterChef.setContractHash(MASTER_CHEF_CONTRACT_HASH);
      try {
        txHash = await masterChef.withdraw(CLPublicKey.fromHex(activeAddress), farm, 0, TRANSFER_FEE);
      } catch (err) {
        setPending(false);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        setPending(false);
        // toast.success("Withdraw");
        return txHash;
      } catch (error) {
        setPending(false);
        return txHash;
      }
    }
  
    async function enterStaking(amount: BigNumberish, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      setPending(true);
      let txHash;
      let masterChef = new MasterChefClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await masterChef.setContractHash(MASTER_CHEF_CONTRACT_HASH);
      try {
        txHash = await masterChef.enterStaking(CLPublicKey.fromHex(activeAddress), amount, TRANSFER_FEE);
      } catch (err) {
        setPending(false);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        setPending(false);
        // toast.success("Deposit");
        return txHash;
      } catch (error) {
        setPending(false);
        return txHash;
      }
    }
  
    async function leaveStaking(amount: BigNumberish, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      setPending(true);
      let txHash;
      let masterChef = new MasterChefClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await masterChef.setContractHash(MASTER_CHEF_CONTRACT_HASH);
      try {
        txHash = await masterChef.leaveStaking(CLPublicKey.fromHex(activeAddress), amount, TRANSFER_FEE);
      } catch (err) {
        setPending(false);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        setPending(false);
        // toast.success("Withdraw");
        return txHash;
      } catch (error) {
        setPending(false);
        return txHash;
      }
    }
  
    async function harvest(farm: {}, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      setPending(true);
      let txHash;
      let masterChef = new MasterChefClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await masterChef.setContractHash(MASTER_CHEF_CONTRACT_HASH);
      try {
        txHash = await masterChef.harvest(CLPublicKey.fromHex(activeAddress), farm, TRANSFER_FEE);
      } catch (err) {
        setPending(false);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        setPending(false);
        // toast.success("Harvest");
        return txHash;
      } catch (error) {
        setPending(false);
        return txHash;
      }
    }
    
    return {
      activate,
      disconnect,
      balanceOf,
      allowanceOf,
      approve,
      getCSPRBalance,
      vest,
      withdraw,
      enterStaking,
      leaveStaking,
      harvest,
      totalVestingAmount
    };
  }
  