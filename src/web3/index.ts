/* eslint-disable react-hooks/exhaustive-deps */
import {
    Signer,
    CLPublicKey,
    CLValueBuilder,
    decodeBase16,
    CasperServiceByJsonRPC,
    CLAccountHash,
  } from "casper-js-sdk";
  import { ERC20SignerClient } from "./clients/erc20signer-client";
  import useNetworkStatus from "../store/useNetworkStatus";
  import { BigNumber, BigNumberish } from "ethers";
  import {
    CHAIN_NAME,
    NODE_ADDRESS,
    TRANSFER_FEE,
  } from "./config/constant";
  
  // import useWalletStatus from "../store/useWalletStatus";
  import { amountWithoutDecimals, getDeploy } from "../utils/utils";
  import { VestingClient } from "./clients/vesting-client";
  import { vestingContractAddress } from "../config";

  export default function useCasperWeb3Provider() {
    const { setActiveAddress, activeAddress } = useNetworkStatus();
    
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
          
    async function vest(cliff_amount: BigNumberish, cliff_duration: BigNumberish, recipient:string, activeAddress:string) 
    {
      let txHash;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {        
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const recipentPubKey = CLPublicKey.fromHex(recipient);
        
        txHash = await vestingManager.vest(clPubKey, cliff_amount.toString(), cliff_duration.toString(), recipentPubKey.toAccountHashStr(), TRANSFER_FEE);
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
  
    async function claim(activeAddress:string) {
      let txHash;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {
        txHash = await vestingManager.claim(CLPublicKey.fromHex(activeAddress), CLPublicKey.fromHex(activeAddress).toAccountHashStr(), TRANSFER_FEE);
      } catch (err) {
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        // toast.success("Withdraw");
        return txHash;
      } catch (error) {
        return txHash;
      }
    }
       
    async function calc_claimable_amount() {      
      let txHash;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {
        txHash = await vestingManager.claimable_amount(CLPublicKey.fromHex(activeAddress), CLPublicKey.fromHex(activeAddress).toAccountHashStr(), TRANSFER_FEE);
      } catch (err) {
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash!);
        // toast.success("Withdraw");
        return txHash;
      } catch (error) {
        return txHash;
      }
    }

    async function getClaimableAmount(activeAddress:string) {
      let lockamount;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {
        lockamount = await vestingManager.claimableAmount(CLPublicKey.fromHex(activeAddress).toAccountHashStr());
        return lockamount;
      } catch (err) {
        return undefined;
      }
    }

    
    async function getVestedAmount(activeAddress:string) {
      let lockamount;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {
        lockamount = await vestingManager.vestedAmount(CLPublicKey.fromHex(activeAddress).toAccountHashStr());
        return lockamount;
      } catch (err) {
        return undefined;
      }
    }
    
    async function getHourlyVesting(activeAddress:string) {
      let lockamount;
      let vestingManager = new VestingClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await vestingManager.setContractHash(vestingContractAddress);
      try {
        lockamount = await vestingManager.hourlyVestAmount(CLPublicKey.fromHex(activeAddress).toAccountHashStr());
        return lockamount;
      } catch (err) {
        return undefined;
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
      claim,
      totalVestingAmount,
      getClaimableAmount,
      getVestedAmount,
      getHourlyVesting,
      calc_claimable_amount
    };
  }
  