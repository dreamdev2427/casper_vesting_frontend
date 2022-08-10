import { BigNumber } from "ethers";

export interface TokenAmount {
    balance: BigNumber;
    allowance: BigNumber;
    amount: BigNumber;
    limit: BigNumber;
}