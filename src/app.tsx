import React, { useState } from "react";
import { Signer, DeployUtil, CasperServiceByJsonRPC, CLPublicKey } from "casper-js-sdk";
import { Button, Typography } from "@mui/material";

import { TABS, SignProviders } from "./constants";
import NativeTransfer from "./views/native-transfer";
import CEP47View from "./views/cep47";
import ReadyDeployView from "./views/ready-deploy-view";
import TorusController from "./torus-wallet";
import SignerController from "./signer-wallet";

import type { ActiveKeyType, SetClientFnType } from "./types.d";
import {NODE_URL} from "./constants";
import Vesting from "./components/Vesting";

type SelectSignFnType = (provider: SignProviders) => void;
type SetActiveKeyFnType = (key: ActiveKeyType) => void;

const SignSelect = ({
  signProvider,
  selectSign,
  activeKey,
  setActiveKey,
  setClient,
}: {
  signProvider: SignProviders | null;
  selectSign: SelectSignFnType;
  activeKey: ActiveKeyType;
  setActiveKey: SetActiveKeyFnType;
  setClient: SetClientFnType;
}) => {
  return (
    <div className="w-100 pa3 bb flex justify-between items-center">
      <div>
        <Button variant="contained" style={{ backgroundColor: '#e8f5fc' }}
          onClick={() => {
            selectSign(SignProviders.Signer);
            setClient(NODE_URL);
          }}
        >
          <Typography color='#055ef0'>Signer</Typography>
        </Button>
        <Button variant="contained" style={{ backgroundColor: '#e8f5fc', marginLeft: "10px" }}
          onClick={() => {
            selectSign(SignProviders.Torus);
          }}
        >
          <Typography color='#055ef0'>Torus</Typography>
        </Button>
      </div>
      {signProvider === SignProviders.Signer && (
        <SignerController activeKey={activeKey} setActiveKey={setActiveKey} setClient={setClient} />
      )}
      {signProvider === SignProviders.Torus && (
        <TorusController activeKey={activeKey} setActiveKey={setActiveKey} setClient={setClient} />
      )}
    </div>
  );
};

const App = () => {
  const [selectedTab, setTab] = useState<TABS | null>(null);

  const setCurrentTab = (tab: TABS) => () => {
    setTab(tab);
    setDeploy(null);
  };

  const [signProvider, setSignProvider] = useState<SignProviders | null>(
    null
  );

  const [client, setClient] = useState<CasperServiceByJsonRPC | null>(null);
  const [activeKey, setActiveKey] = useState<ActiveKeyType>("");
  const [deploy, setDeploy] = useState<DeployUtil.Deploy | null>(null);
  const [deployHash, setDeployHash] = useState<string | null>(null);

  const selectSign: SelectSignFnType = (signProvider) => {
    setClient(null);
    setActiveKey("");
    setDeploy(null);
    setTab(null);
    setSignProvider(signProvider);
  };

  const setCasperClient = (provider: any) => {
    setClient(new CasperServiceByJsonRPC(provider));
  };

  const signAndSendDeploy = async (deploy: DeployUtil.Deploy) => {
    if (!client) throw new Error("Client not set");

    if (signProvider === SignProviders.Signer) {
      const deployJSON = DeployUtil.deployToJson(deploy);

      const targetPubKey = deploy.session.transfer ? (deploy.session.transfer?.args.args.get("target") as CLPublicKey).toHex() : activeKey;

      let signedDeployJSON;
      try{
      signedDeployJSON = await Signer.sign(
        deployJSON,
        activeKey,
        targetPubKey
      );
      }catch(err){
        console.error("1 : ", err);
      }

      const reconstructedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
      try{
        const { deploy_hash: deployHash }= await client.deploy(reconstructedDeploy);
        setDeployHash(deployHash);
      }catch(err)
      {
        console.error("2 : ", err);
      }
    }

    if (signProvider === SignProviders.Torus) {
      try{
        const { deploy_hash: deployHash }= await client.deploy(deploy);
        setDeployHash(deployHash);
      }catch(err)
      {
        console.error("3 : ", err);
      }
    }
  };

  const renderProperContent = () => {
    if (activeKey && deployHash) {
      return (
        <div>
          <h1>Deploy hash:</h1> {deployHash}
        </div>
      );
    }
    if (activeKey && !deploy) {
      switch (selectedTab) {
        case TABS.INSTALL_CEP47:
          return <CEP47View activeKey={activeKey} setDeploy={setDeploy} />;
        default: 
          return <NativeTransfer activeKey={activeKey} setDeploy={setDeploy} />
      }
    }
    if (activeKey && deploy) {
      return (
        <ReadyDeployView
          deploy={deploy!}
          activeKey={activeKey}
          signAndSendDeploy={signAndSendDeploy}
        />
      );
    }
  };

  return (
    <div style={{ backgroundColor:"black" }}>
      <SignSelect
        signProvider={signProvider}
        selectSign={selectSign}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        setClient={setCasperClient}
      />     
    <Vesting />
    </div>
  );
};

export default App;
