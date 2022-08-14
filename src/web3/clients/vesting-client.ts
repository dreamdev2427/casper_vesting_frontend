import {
    CLValueParsers,
    RuntimeArgs,
    CLPublicKey,
    CLU256,
    CLString,
    CLKey,
    CLAccountHash,
    CLValueBuilder,
    CLU64,
} from "casper-js-sdk";
import blake from "blakejs";
import { concat } from "@ethersproject/bytes";
import { BigNumberish } from "@ethersproject/bignumber";
import { helpers, constants, utils } from "casper-js-client-helper";
import ContractClient from "casper-js-client-helper/dist/casper-contract-client";
import { CONTRACT_PACKAGE_PREFIX } from "../config/constant";
import { contractCallFn } from "./utils";
import { RecipientType } from "casper-js-client-helper/dist/types";
const {
    setClient,
    contractSimpleGetter,
} = helpers;
const { DEFAULT_TTL } = constants;

export class VestingClient extends ContractClient {
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
            ["total-vest-amount"]
        );
    }

    async claimableAmount() 
    {        
        return await contractSimpleGetter(
            this.nodeAddress,
            this.contractHash!,
            ["recipient_infos_1"]
        );
    }

    async vest(
        publicKey: RecipientType,
        cliff_amount: BigNumberish,
        cliff_durtime: BigNumberish,
        acc_recip: string,
        paymentAmount: BigNumberish,
        ttl = DEFAULT_TTL
    ) {
        console.log(cliff_amount.toString());
        console.log(cliff_durtime.toString());
        console.log(acc_recip);

        const runtimeArgs = RuntimeArgs.fromMap({
            cliff_durtime: new CLU64(cliff_durtime),
            cliff_amount: new CLU256(cliff_amount),
            acc_recip: new CLString('account-hash-'+acc_recip.toString())
        });

        return await this.contractCallWithSigner({
            publicKey,
            entryPoint: "vest",
            paymentAmount,
            runtimeArgs,
            cb: (deployHash: string) =>
                {},
            ttl,
        } as VestingClient.ContractCallWithSignerPayload);
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
        } as VestingClient.ContractCallWithSignerPayload);
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
        } as VestingClient.ContractCallWithSignerPayload);
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
        } as VestingClient.ContractCallWithSignerPayload);
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