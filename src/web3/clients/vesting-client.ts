import {
    RuntimeArgs,
    CLPublicKey,
    CLU256,
    CLString,
    CLU64,
} from "casper-js-sdk";
import { BigNumberish } from "@ethersproject/bignumber";
import { helpers, constants, utils } from "casper-js-client-helper";
import ContractClient from "casper-js-client-helper/dist/casper-contract-client";
import { contractCallFn } from "./utils";
import { urfOfUserInfo } from "../../config";
const {
    setClient,
    contractSimpleGetter,
} = helpers;
const { DEFAULT_TTL } = constants;

export class VestingClient extends ContractClient {

    async setContractHash(hash: string) {
        const { contractPackageHash } = await setClient(
            this.nodeAddress,
            hash,
            [
            ]
        );
        this.contractHash = hash;
        this.contractPackageHash = contractPackageHash;
    }

    async contractCallWithSigner({
        publicKey,
        paymentAmount,
        entryPoint,
        runtimeArgs,
        cb,
        ttl = DEFAULT_TTL,
        dependencies = [],
      }: VestingClient.ContractCallWithSignerPayload) {
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

    async totalVestingAmount() 
    {        
        return await contractSimpleGetter(
            this.nodeAddress,
            this.contractHash!,
            ["total_lock_amount"]
        );
    }
    
    async claimableAmount(activeAccountHash: string) {
        const userHash30 = activeAccountHash.substring(13, 43);
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                userHash30+"5",
                urfOfUserInfo
            );
            let userInfo: any = result;
            return userInfo;
        }
        catch (error: any) {
            console.log("claimableAmount exception : ", error);
            return undefined;
        }
    }

    async vestedAmount(activeAccountHash: string) {
        const userHash30 = activeAccountHash.substring(13, 43);
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                userHash30+"3",
                urfOfUserInfo
            );
            let userInfo: any = result;
            return userInfo;
        }
        catch (error: any) {
            console.log("vestedAmount exception : ", error);
            return undefined;
        }
    }
    
    async hourlyVestAmount(activeAccountHash: string) {
        const userHash30 = activeAccountHash.substring(13, 43);
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                userHash30+"4",
                urfOfUserInfo
            );
            let userInfo: any = result;
            return userInfo;
        }
        catch (error: any) {
            console.log("hourlyVestAmount exception : ", error);
            return undefined;
        }
    }

    async vest(
        publicKey: CLPublicKey,
        cliff_amount: BigNumberish,
        cliff_durtime: BigNumberish,
        recipient: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            cliff_durtime: new CLU64(cliff_durtime),
            cliff_amount: new CLU256(cliff_amount),
            recipient: new CLString(recipient.toString())
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "lock",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as VestingClient.ContractCallWithSignerPayload);
    }

    async claim(
        publicKey: CLPublicKey,
        recipient: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            recipient: new CLString(recipient.toString())
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "claim",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as VestingClient.ContractCallWithSignerPayload);
    }

    
    async claimable_amount(
        publicKey: CLPublicKey,
        recipient: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            recipient: new CLString(recipient.toString())
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "claimable_amount",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as VestingClient.ContractCallWithSignerPayload);
    }
}
export namespace VestingClient {
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