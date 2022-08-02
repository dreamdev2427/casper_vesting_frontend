export enum SignProviders {
  Signer,
  Torus,
}

export enum TABS {
  TRANSFER,
  INSTALL_CEP47
}

export const NODE_URL = "http://3.208.91.63:7777/rpc" || process.env.REACT_APP_NODE_URL;
export const NETWORK_NAME = "casper-test" || process.env.REACT_APP_NETWORK_NAME;
