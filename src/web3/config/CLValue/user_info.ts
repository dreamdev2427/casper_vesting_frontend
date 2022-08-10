import { CLErrorCodes, CLType, CLTypeTag, CLU256, CLU256BytesParser, CLValue, CLValueBytesParsers, ResultAndRemainder, resultHelper, ToBytesResult } from "casper-js-sdk";
import { BigNumberish } from "ethers";
import {concat} from "@ethersproject/bytes";
import { Ok, Err } from 'ts-results';
export class CLUserInfoType extends CLType {
  tag = CLTypeTag.Any;
  linksTo = CLUserInfo;

  toString(): string {
    return "UserInfo";
  }

  toJSON(): string {
    return this.toString();
  }
}

export type UserInfo = {
    amount: BigNumberish,
    rewardDebt: BigNumberish    
}

export class CLUserInfoBytesParser extends CLValueBytesParsers {
    toBytes(val: CLUserInfo): ToBytesResult {
        const {data} = val;
        let result = new CLU256BytesParser().toBytes(new CLU256(data.amount)).unwrap();
        result = concat([result, new CLU256BytesParser().toBytes(new CLU256(data.rewardDebt)).unwrap()]);
        return Ok(new Uint8Array(result));
    }

    fromBytesWithRemainder(bytes: Uint8Array): ResultAndRemainder<CLUserInfo, CLErrorCodes> {
        let {result: amountResult, remainder: remainder1} = new CLU256BytesParser().fromBytesWithRemainder(bytes);
        let {result: rewardDebtResult, remainder: remainder2} = new CLU256BytesParser().fromBytesWithRemainder(remainder1!);
        if (amountResult.ok && rewardDebtResult.ok) {
            let user: UserInfo = {amount: amountResult.val.value(), rewardDebt: rewardDebtResult.val.value()};
            return resultHelper(Ok(new CLUserInfo(user)), remainder2);
        }
        return resultHelper(Err(CLErrorCodes.Formatting));
    }
}

export class CLUserInfo extends CLValue {
  data: UserInfo;
  bytesParser: CLUserInfoBytesParser;

  constructor(v: UserInfo) {
    super();
    this.bytesParser = new CLUserInfoBytesParser();
    this.data = v;
  }

  clType(): CLType {
    return new CLUserInfoType();
  }

  value(): UserInfo {
    return this.data;
  }

  toBytes(): ToBytesResult{
    return new CLUserInfoBytesParser().toBytes(this);
  }
}