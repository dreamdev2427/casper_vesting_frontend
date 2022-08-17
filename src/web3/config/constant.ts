  export const NODE_ADDRESS =
    process.env.REACT_APP_CASPER_NODE_ADDRESS ||
    "https://casper.the-swappery.io/api/cors?url=http://5.9.20.162:7777/rpc";
  
  export const CHAIN_NAME = process.env.REACT_APP_CHAIN_NAME || "casper-test";
  
  export const WCSPR_CONTRACT_HASH =
    "3d3d5301e1a1deb700fb018bc8a0d52514ff7e169bd3fe75c3f9b72440ec21f6";
  
  export const TRANSFER_FEE = 10 * 10 ** 9;
  export const INSTALL_FEE = 3 * 10 ** 9;
  
  export const CONTRACT_PACKAGE_PREFIX = "contract-package-wasm";