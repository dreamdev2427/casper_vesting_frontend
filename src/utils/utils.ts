import { sleep } from "casper-js-client-helper/dist/helpers/utils";
import { CasperClient } from "casper-js-sdk";
import { BigNumber } from "ethers";
import { Token } from "../config/interface/token";
import { formatFixed } from "@ethersproject/bignumber";

export const CAPSER_DEFAULT_DECIMALS = 9;

export const shortenAddress = (address: string, length: number = 4) => {
    return address.slice(0, length + 1) + "..." + address.slice(-length);
}
export const amountWithoutDecimals = (amount: BigNumber, decimals = CAPSER_DEFAULT_DECIMALS) => {
  let result = formatFixed(amount, decimals);
  return parseFloat(result);
}

export const deserialize = (serializedString: string) => {
    // eslint-disable-next-line no-eval
    return eval('(' + serializedString + ')');
}

export const getAmountsOut = (amount: BigNumber, reserves: BigNumber[][], decimals: number) => {
  let tempAmount = amount;
  reserves.forEach((reserve) => {
    if(reserve[0].eq(0) || reserve[1].eq(0)) { tempAmount = BigNumber.from(0); return; }
    tempAmount = tempAmount
      .mul(998)
      .mul(reserve[1])
      .div(reserve[0].mul(1000).add(tempAmount.mul(998)));
  });
  return amountWithoutDecimals(tempAmount, decimals);
}

export const getAmountsIn = (amount: BigNumber, reserves: BigNumber[][], decimals: number) => {
  let tempAmount = amount;
  if (amount.eq(0)) return 0;
  reserves.forEach((reserve) => {
    if(reserve[0].eq(0) || reserve[1].eq(0)) { tempAmount = BigNumber.from(0); return; }
    tempAmount = reserve[0]
      .mul(tempAmount)
      .mul(1000)
      .div(reserve[1].sub(tempAmount).mul(998)).abs()
      .add(1);
  });
  return amountWithoutDecimals(tempAmount, decimals);
};

export const getPriceImpact = (input: number, output: number, reserves: BigNumber[][]) => {
  let fullOutput = input;
  reserves.forEach((reserve) => {
    if(reserve[0].eq(0) || reserve[1].eq(0)) { fullOutput = 0; return; }
    fullOutput = fullOutput * amountWithoutDecimals(reserve[1]) / amountWithoutDecimals(reserve[0]);
  });
  return (fullOutput - output) / fullOutput * 100;
}

export const getTokenFromAddress = (address: string, tokens: Token[]): Token | undefined => {
  for (var i = 0 ; i < tokens.length ; i ++) {
    if(tokens[i].address === address) return tokens[i];
  }
  return;
}

export const reverseDoubleArray = (input: BigNumber[][]): BigNumber[][] => {
  let output: BigNumber[][] = [];
  for (var i = 1 ; i <= input.length ; i ++) {
    output.push([input[input.length - i][1], input[input.length - i][0]]);
  }
  return output;
}

export const getDeploy = async (NODE_URL: string, deployHash: string) => {
  const client = new CasperClient(NODE_URL);
  let i = 300;
  while (i !== 0) {
    const [deploy, raw] = await client.getDeploy(deployHash);
    if (raw.execution_results.length !== 0) {
      // @ts-ignore
      if (raw.execution_results[0].result.Success) {
        return deploy;
      } else {
        // @ts-ignore
        throw Error(
          "Contract execution: " +
            // @ts-ignore
            raw.execution_results[0].result.Failure.error_message
        );
      }
    } else {
      i--;
      await sleep(1000);
      continue;
    }
  }
  throw Error("Timeout after " + i + "s. Something's wrong");
};

export enum ExplorerDataType {
  DEPLOY = "deploy",
  CONTRACT = "contract",
  ACCOUNT = "account",
  BLOCK = "block",
}

export function getCsprExplorerLink(
  data: string,
  type: ExplorerDataType
): string {
  const prefix = "https://testnet.cspr.live";

  switch (type) {
    case ExplorerDataType.DEPLOY:
      return `${prefix}/deploy/${data}`;

    case ExplorerDataType.CONTRACT:
      return `${prefix}/contract/${data}`;

    case ExplorerDataType.BLOCK:
      return `${prefix}/block/${data}`;

    case ExplorerDataType.ACCOUNT:
      return `${prefix}/account/${data}`;
    default:
      return `${prefix}`;
  }
}
