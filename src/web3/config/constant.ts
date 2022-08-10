  export const NODE_ADDRESS =
    process.env.REACT_APP_CASPER_NODE_ADDRESS ||
    "https://casper.the-swappery.io/api/cors?url=http://5.9.20.162:7777/rpc";
  
  export const EVENT_STREAM_ADDRESS =
    process.env.REACT_APP_EVENT_STREAM_ADDRESS ||
    "http://5.9.20.162:9999/events/main";
  export const CHAIN_NAME = process.env.REACT_APP_CHAIN_NAME || "casper-test";
  
  export const WCSPR_CONTRACT_HASH =
    "3d3d5301e1a1deb700fb018bc8a0d52514ff7e169bd3fe75c3f9b72440ec21f6";
  
  export const ROUTER_CONTRACT_HASH =
    "dc32f60fa3fe420f5e3b4acce68ca8b71f2351bf2b6d65b8ae1fca5f17577815";
  
  export const ROUTER_CONTRACT_PACKAGE_HASH =
    "40e52abd5dc4069be51af7496d5aa2b9a2b7b82e739f0bad9c6ca8c5a570dd8e";
  
  // export const MASTER_CHEF_CONTRACT_HASH = "d5ce08556247a0025379fddf4cf8f0c67ad656390d2817967c6b3cf356b86bab";
  
  // export const MASTER_CHEF_CONTRACT_PACKAGE_HASH = "e91a2ffaec3cd825857e48fad248918f1a8f8461a60711adf26c7a892c41857a";
  
  export const SYRUP_TOKEN_CONTRACT_HASH =
    "f66b7fcdd15a7084a2d37df27935373725d577017f450dd7504fb3b88c016505";
  
  export const TRANSFER_FEE = 10 * 10 ** 9;
  export const INSTALL_FEE = 3 * 10 ** 9;
  
  export const CONTRACT_PACKAGE_PREFIX = "contract-package-wasm";
  
  export const MASTER_CHEF_CONTRACT_HASH =
    "93247306934efdec6e0ef67bf6f576db79203711558e9e3fe0863f0cc2ea33f0";
  
  export const MASTER_CHEF_CONTRACT_PACKAGE_HASH =
    "10e1e1762474bdf130ed3d745a59feb4776fefe3ddad20632797597fe16deab9";
  