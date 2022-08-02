import { useState, useEffect } from "react";
import { CLPublicKey, DeployUtil } from "casper-js-sdk";

import { TextInput } from "../common";
import { NETWORK_NAME } from "../constants";
import type { ActiveKeyType, SetDeployFnType } from "../types.d";

const randomNumericId = () => Math.floor(Math.random() * 1000000000);
const DEPLOY_GAS_PAYMENT_FOR_NATIVE_TRANSFER = 100000;

const NativeTransfer = ({
  setDeploy,
  activeKey,
}: {
  setDeploy: SetDeployFnType;
  activeKey: ActiveKeyType;
}) => {
  const [amount, setAmount] = useState("2500000000");
  const [recepient, setRecepient] = useState<string>("");

  const createDeploy = () => {
    console.log("0")
    const receiverClPubKey = CLPublicKey.fromHex(
      "02036d0a481019747b6a761651fa907cc62c0d0ebd53f4152e9f965945811aed2ba8"
    );
    console.log("1")
    const senderKey = CLPublicKey.fromHex(activeKey);

    var deployParams =  new DeployUtil.DeployParams(senderKey, NETWORK_NAME!, 1, 1800000);
    console.log("deployParams = ", deployParams);
    var session = DeployUtil.ExecutableDeployItem.newTransfer(
      amount.toString(),
      receiverClPubKey,
      null,
      randomNumericId().toString()
    );
    console.log("session = ", session);

    var payment = DeployUtil.standardPayment(DEPLOY_GAS_PAYMENT_FOR_NATIVE_TRANSFER);
    console.log("payment = ", payment);
      
    const deploy = DeployUtil.makeDeploy(
      deployParams,
      session,
      payment
    );
    console.log("3")
    setDeploy(deploy);
    console.log("4")
  };

  return (
    <div>
      <h1>Native Transfer</h1>
        <TextInput
          value={amount} 
          placeholder="Amount"
          onChange={setAmount}
        />
        <TextInput
          value={recepient}
          placeholder="Recepient PublicKey"
          onChange={setRecepient}
        />
        <button onClick={() => { createDeploy() }}>Create Deploy</button>
    </div>
  );
};

export default NativeTransfer;
