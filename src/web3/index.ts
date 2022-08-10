/* eslint-disable react-hooks/exhaustive-deps */
import {
    Signer,
    CLPublicKey,
    CLValueBuilder,
    decodeBase16,
    CasperServiceByJsonRPC,
    CLValueParsers,
    CLMap,
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
  
    async function allowanceOf(contractHash: string, spender: string, activeAddress:string) {
      const erc20 = new ERC20SignerClient(NODE_ADDRESS, CHAIN_NAME, undefined);
      await erc20.setContractHash(contractHash);
      let allowance;
      try {
        allowance = await erc20.allowances(
          CLPublicKey.fromHex(activeAddress),
          CLValueBuilder.byteArray(decodeBase16(spender))
        );
      } catch (error) {
        return 0;
      }
      return allowance;
    }
  
    async function balanceOf(contractHash: string, activeAddress:string) {

      console.log("activeAddress = ",activeAddress);

      const erc20 = new ERC20SignerClient(NODE_ADDRESS, CHAIN_NAME, undefined);
      await erc20.setContractHash(contractHash);
      let balance;
      try {
        balance = await erc20.balanceOf(CLPublicKey.fromHex(activeAddress));
      } catch (error) {
        return 0;
      }
      return balance;
    }
  
    async function approve(amount: BigNumberish, address: string, spender: string, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      if (!isConnected) return;
      let txHash = "";
      setPending(true);
      const erc20 = new ERC20SignerClient(NODE_ADDRESS, CHAIN_NAME, undefined);
      await erc20.setContractHash(address);
      const clPK = CLPublicKey.fromHex(activeAddress);
      try {
        txHash = await erc20.approveWithSigner(
          clPK,
          amount,
          CLValueBuilder.byteArray(decodeBase16(spender)),
          TRANSFER_FEE
        );
      } catch (err) {
        setPending(false);
        return;
      }
      try {
        await getDeploy(NODE_ADDRESS, txHash);
        setPending(false);
        // toast.success("Approved");
        return txHash;
      } catch (error) {
        setPending(false);
        return txHash;
      }
    }
  
    async function getCSPRBalance(activeAddress:string) {
      const client = new CasperServiceByJsonRPC(NODE_ADDRESS);
      let stateRootHash = await client.getStateRootHash();
      let accountBalance = BigNumber.from(0);
      if (!isConnected) return 0;
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
      
    async function deposit(farm: {}, amount: BigNumberish, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      if (!isConnected) return;
      setPending(true);
      let txHash;
      let masterChef = new MasterChefClient(
          NODE_ADDRESS,
          CHAIN_NAME,
          undefined
        );
      await masterChef.setContractHash(MASTER_CHEF_CONTRACT_HASH);
      try {
        txHash = await masterChef.deposit(CLPublicKey.fromHex(activeAddress), farm, amount, TRANSFER_FEE);
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
  
    async function withdraw(farm: {}, amount: BigNumberish, setPending: React.Dispatch<React.SetStateAction<boolean>>, activeAddress:string) {
      if (!isConnected) return;
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
      if (!isConnected) return;
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
      if (!isConnected) return;
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
      if (!isConnected) return;
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
      deposit,
      withdraw,
      enterStaking,
      leaveStaking,
      harvest,
    };
  }
  
  export const routerEventParser = (
    {
      eventNames,
    }: { eventNames: [] },
    value: any
  ) => {
    if (value.body.DeployProcessed.execution_result.Success) {
      const { transforms } =
        value.body.DeployProcessed.execution_result.Success.effect;
  
          const routerEvents = transforms.reduce((acc: any, val: any) => {
            if (
              val.transform.hasOwnProperty("WriteCLValue") &&
              typeof val.transform.WriteCLValue.parsed === "object" &&
              val.transform.WriteCLValue.parsed !== null
            ) {
              const maybeCLValue = CLValueParsers.fromJSON(
                val.transform.WriteCLValue
              );
              const clValue = maybeCLValue.unwrap();
              if (clValue && clValue instanceof CLMap) {
                const event = clValue.get(CLValueBuilder.string("event_type"));
                if (
                  event 
                ) {
                  acc = [...acc, { name: event.value(), clValue }];
                }
              }
            }
            return acc;
          }, []);
  
      return {
        error: null,
        success: !!routerEvents.length,
        data: routerEvents,
        account: value.body.DeployProcessed.account,
        deploy: value.body.DeployProcessed.deploy_hash
      };
    }
  
    return {
      error: true,
      account: value.body.DeployProcessed.account,
      deploy: value.body.DeployProcessed.deploy_hash,
      message: value.body.DeployProcessed.execution_result.Failure.error_message
    };
  };
  
  export const farmEventParser = (
    {
      eventNames,
    }: { eventNames: [] },
    value: any
  ) => {
    if (value.body.DeployProcessed.execution_result.Success) {
      const { transforms } =
        value.body.DeployProcessed.execution_result.Success.effect;
  
          const farmEvents = transforms.reduce((acc: any, val: any) => {
            if (
              val.transform.hasOwnProperty("WriteCLValue") &&
              typeof val.transform.WriteCLValue.parsed === "object" &&
              val.transform.WriteCLValue.parsed !== null
            ) {
              const maybeCLValue = CLValueParsers.fromJSON(
                val.transform.WriteCLValue
              );
              const clValue = maybeCLValue.unwrap();
              if (clValue && clValue instanceof CLMap) {
                const event = clValue.get(CLValueBuilder.string("event_type"));
                if (
                  event
                ) {
                  acc = [...acc, { name: event.value(), clValue }];
                }
              }
            }
            return acc;
          }, []);
  
      return {
        error: null,
        success: !!farmEvents.length,
        data: farmEvents,
        account: value.body.DeployProcessed.account,
        deploy: value.body.DeployProcessed.deploy_hash
      };
    }
  
    return {
      error: true,
      account: value.body.DeployProcessed.account,
      deploy: value.body.DeployProcessed.deploy_hash,
      message: value.body.DeployProcessed.execution_result.Failure.error_message
    };
  };
  