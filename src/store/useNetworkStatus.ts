import create, { State } from "zustand";

interface NetworkStatus extends State {
  isConnected: boolean;
  activeAddress: string;
  setConnected: (isConnected: boolean) => void;
  setActiveAddress: (activeAddress: string | undefined) => void;
}

const useNetworkStatus = create<NetworkStatus>(
    (set) => ({
  isConnected: false,
  activeAddress: "",
  setConnected: (isConnected: boolean) => set(() => ({ isConnected })),
  setActiveAddress: (address: string | undefined) =>
    set(() => {
      const activeAddress = address ? address : "";
      const isConnected = activeAddress === "" ? false : true;
      return {
        activeAddress,
        isConnected,
      };
    }),
}));

export default useNetworkStatus;
