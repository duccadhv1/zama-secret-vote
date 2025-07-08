import { Chain } from "viem";
import { useChainId } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// Define Hardhat local chain
const hardhatLocal: Chain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Hardhat", url: "http://localhost:8545" },
  },
  testnet: true,
};

export const useChain = () => {
  const chainId = useChainId();

  // Get the appropriate chain object based on chainId
  let chain: Chain;
  switch (chainId) {
    case mainnet.id:
      chain = mainnet;
      break;
    case sepolia.id:
      chain = sepolia;
      break;
    case hardhatLocal.id:
      chain = hardhatLocal;
      break;
    default:
      // Default to hardhat local for development
      chain = hardhatLocal;
  }

  return {
    chainId,
    chain,
  };
};
