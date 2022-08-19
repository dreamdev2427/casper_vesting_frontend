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
    
    async claimableAmount(activeAddress: string, tokenHash: string) {
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const prefix = clPubKey.toAccountHashStr().substring(13, 29);
        const suffix = tokenHash.substring(0,15);

        const itemHash = prefix+suffix;
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                itemHash+"7",
                urfOfUserInfo
            );
            let userInfo: any = result;
            return userInfo;
        }
        catch (error: any) {
            return undefined;
        }
    }

    async vestedAmount(activeAddress: string, tokenHash: string) {       
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const prefix = clPubKey.toAccountHashStr().substring(13, 29);
        const suffix = tokenHash.substring(0,15);

        const itemHash = prefix+suffix;
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                itemHash+"3",
                urfOfUserInfo
            );
            let userInfo: any = result;
            return userInfo;
        }
        catch (error: any) {
            return undefined;
        }
    }
        
    async hourlyVestAmount(activeAddress: string, tokenHash: string) {    
        const clPubKey = CLPublicKey.fromHex(activeAddress);
        const prefix = clPubKey.toAccountHashStr().substring(13, 29);
        const suffix = tokenHash.substring(0,15);

        const itemHash = prefix+suffix;
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                itemHash+"5",
                urfOfUserInfo
            );
            let userInfo: any = result;
            return userInfo;
        }
        catch (error: any) {
            return undefined;
        }
    }

    async vest(
        publicKey: CLPublicKey,
        token_hash: string,
        cliff_amount: BigNumberish,
        cliff_durtime: BigNumberish,
        unit_time: BigNumberish,        
        recipient: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            "cliff_durtime": new CLU64(cliff_durtime),
            "cliff_amount": new CLU256(cliff_amount),
            "unit_time": new CLU64(unit_time),
            "recipient": new CLString(recipient.toString()),
            "token-hash": new CLString("contract-"+token_hash.toString())
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
        token_hash: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            "recipient": new CLString(recipient.toString()),
            "token-hash": new CLString("contract-"+token_hash.toString()),
            "uparse": new CLU64("10")
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
        token_hash: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            "recipient": new CLString(recipient.toString()),
            "token-hash": new CLString("contract-"+token_hash),
            "uparse": new CLU64("9")
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