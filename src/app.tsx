import { useState } from "react";
import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { Button, Typography } from "@mui/material";

import { SignProviders } from "./constants";
import SignerController from "./signer-wallet";

import type { ActiveKeyType, SetClientFnType } from "./types.d";
import {NODE_URL} from "./constants";
import Vesting from "./components/Vesting";
import { useDispatch } from "react-redux";
import { setConnectedWalletAddress } from "./store/actions/auth.actions";

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
  const dispatch = useDispatch();

  const setActiveKeyToStore = (key:any) => {
    setConnectedWalletAddress(key)(dispatch);
    setActiveKey(key);
  }

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
      </div>
      {signProvider === SignProviders.Signer && (
        <SignerController activeKey={activeKey} setActiveKey={setActiveKeyToStore} setClient={setClient} />
      )}
    </div>
  );
};

const App = () => {

  const [signProvider, setSignProvider] = useState<SignProviders | null>(
    null
  );

  const [client, setClient] = useState<CasperServiceByJsonRPC | null>(null);
  const [activeKey, setActiveKey] = useState<ActiveKeyType>("");

  const selectSign: SelectSignFnType = (signProvider) => {
    setClient(null);
    setActiveKey("");
    setSignProvider(signProvider);
  };

  const setCasperClient = (provider: any) => {
    setClient(new CasperServiceByJsonRPC(provider));
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
