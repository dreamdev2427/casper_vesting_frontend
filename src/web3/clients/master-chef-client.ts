import {
    CLValueParsers,
    RuntimeArgs,
    CLPublicKey,
    CLU256,
    CLString,
    CLKey,
    CLAccountHash,
    CLValueBuilder,
} from "casper-js-sdk";
import blake from "blakejs";
import { concat } from "@ethersproject/bytes";
import { BigNumberish } from "@ethersproject/bignumber";
import { helpers, constants, utils } from "casper-js-client-helper";
import ContractClient from "casper-js-client-helper/dist/casper-contract-client";
import { CONTRACT_PACKAGE_PREFIX } from "../config/constant";
import { contractCallFn } from "./utils";
const {
    setClient,
    contractSimpleGetter,
} = helpers;
const { DEFAULT_TTL } = constants;

export class MasterChefClient extends ContractClient {
    protected namedKeys?: {
        userList: string;
        poolList: string;
    };

    async setContractHash(hash: string) {
        const { contractPackageHash, namedKeys } = await setClient(
            this.nodeAddress,
            hash,
            [
                "user_list",
                "pool_list"
            ]
        );
        this.contractHash = hash;
        this.contractPackageHash = contractPackageHash;
        /* @ts-ignore */
        this.namedKeys = namedKeys;
    }

    async bonusMultiplier() {
        return await contractSimpleGetter(
        this.nodeAddress,
        this.contractHash!,
        ["bonus_multiplier"]
        );
    }

    async cakePerBlock() {
        return await contractSimpleGetter(
        this.nodeAddress,
        this.contractHash!,
        ["cake_per_block"]
        );
    }

    async startBlockTime() {
        return await contractSimpleGetter(
        this.nodeAddress,
        this.contractHash!,
        ["start_block_time"]
        );
    }

    async totalAllocPoint() {
        return await contractSimpleGetter(
        this.nodeAddress,
        this.contractHash!,
        ["total_alloc_point"]
        );
    }

    async getUserInfo(lpToken: CLKey, user: CLPublicKey) {
        const userHash = new CLKey(new CLAccountHash(user.toAccountHash()));
        const finalBytes = concat([CLValueParsers.toBytes(lpToken).unwrap(), CLValueParsers.toBytes(userHash).unwrap()]);
        const blaked = blake.blake2b(finalBytes, undefined, 32);
        const encodedBytes = Buffer.from(blaked).toString("hex");
        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                encodedBytes,
                this.namedKeys!.userList
            );
            // let userInfo: CLUserInfo = new CLUserInfoBytesParser().fromBytesWithRemainder(result.val.data).result.unwrap();
            return {}; //userInfo.data;
        }
        catch (err: any) {
            return {amount: 0, rewardDebt: 0};
        }
    }

    async contractCallWithSigner({
        publicKey,
        paymentAmount,
        entryPoint,
        runtimeArgs,
        cb,
        ttl = DEFAULT_TTL,
        dependencies = [],
      }: MasterChefClient.ContractCallWithSignerPayload) {
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

    async deposit(
        publicKey: CLPublicKey,
        farm: {}, //FarmInfo,
        amount: BigNumberish,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            amount: new CLU256(amount),
            lp_token: new CLString(CONTRACT_PACKAGE_PREFIX) // + farm.lpToken.contractPackageHash),
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "deposit",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as MasterChefClient.ContractCallWithSignerPayload);
    }

    async withdraw(
        publicKey: CLPublicKey,
        farm: {}, //FarmInfo,
        amount: 0, //BigNumberish,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            amount: new CLU256(amount),
            lp_token: new CLString(CONTRACT_PACKAGE_PREFIX) // + farm.lpToken.contractPackageHash),
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "withdraw",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as MasterChefClient.ContractCallWithSignerPayload);
    }
     async enterStaking(
        publicKey: CLPublicKey,
        amount: BigNumberish,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            amount: new CLU256(amount),
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "enter_staking",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as MasterChefClient.ContractCallWithSignerPayload);
    }

    async leaveStaking(
        publicKey: CLPublicKey,
        amount: BigNumberish,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            amount: new CLU256(amount),
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "leave_staking",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as MasterChefClient.ContractCallWithSignerPayload);
    }

    async harvest(
        publicKey: CLPublicKey,
        farm: {}, //FarmInfo,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        const runtimeArgs = RuntimeArgs.fromMap({
            lp_token: new CLString(CONTRACT_PACKAGE_PREFIX) // + farm.lpToken.contractPackageHash),
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "harvest",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as MasterChefClient.ContractCallWithSignerPayload);
    }
}
export namespace MasterChefClient {
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