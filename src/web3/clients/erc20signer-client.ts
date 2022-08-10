import {
    ERC20Client,
    constants as erc20constants,
  } from "casper-erc20-js-client";
  import { constants, helpers } from "casper-js-client-helper";
  import {
    RuntimeArgs,
    CLValueBuilder,
    CLPublicKey,
  } from "casper-js-sdk";
  import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
  
  import { contractCallFn } from "./utils";
  import { RecipientType } from "casper-js-client-helper/dist/types";
  import { parseFixed } from "@ethersproject/bignumber";
  
  const { DEFAULT_TTL } = constants;
  const { ERC20Events } = erc20constants;
  const { createRecipientAddress } = helpers;
  
  export class ERC20SignerClient extends ERC20Client {
    async getBalance(publicKey: CLPublicKey) {
      let balance;
      try {
        balance = await this.balanceOf(publicKey);
        balance = parseFixed(balance);
      } catch (err) {
        // exception when no tokens in user account
        balance = BigNumber.from(0);
      }
      return balance;
    }
  
    async approveWithSigner(
      publicKey: CLPublicKey,
      approveAmount: BigNumberish,
      spender: RecipientType,
      paymentAmount: BigNumberish,
      ttl = DEFAULT_TTL
    ) {
      const runtimeArgs = RuntimeArgs.fromMap({
        spender: createRecipientAddress(spender),
        amount: CLValueBuilder.u256(approveAmount),
      });
  
      return await this.contractCallWithSigner({
        entryPoint: "approve",
        publicKey,
        paymentAmount,
        runtimeArgs,
        cb: (deployHash: string) =>
          this.addPendingDeploy(ERC20Events.Approve, deployHash),
        ttl,
      } as ERC20SignerClient.ContractCallWithSignerPayload);
    }
  
    async contractCallWithSigner({
      publicKey,
      paymentAmount,
      entryPoint,
      runtimeArgs,
      cb,
      ttl = DEFAULT_TTL,
      dependencies = [],
    }: ERC20SignerClient.ContractCallWithSignerPayload) {
      if (!this.contractHash) throw Error("Invalid Conract Hash");
      const deployHash = await contractCallFn({
        chainName: this.chainName,
        contractHash: this.contractHash,
        entryPoint,
        paymentAmount,
        nodeAddress: this.nodeAddress,
        publicKey,
        runtimeArgs,
        ttl,
        dependencies,
      });
  
      if (deployHash !== null) {
        cb && cb(deployHash);
        return deployHash;
      } else {
        throw Error("Invalid Deploy");
      }
    }
  }
  
  export namespace ERC20SignerClient {
    export interface ContractCallWithSignerPayload {
      publicKey: CLPublicKey;
      paymentAmount: BigNumberish;
      entryPoint: string;
      runtimeArgs: RuntimeArgs;
      cb: any;
      ttl: number;
      dependencies: string[];
    }
  }
  