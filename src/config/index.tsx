import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { NEXT_PUBLIC_PROJECT_ID } from "./env";

// Get projectId from https://cloud.reown.com
export const projectId =
  NEXT_PUBLIC_PROJECT_ID || "dummy-project-id-for-local-dev";

export const metadata = {
  name: "SecretVote",
  description: "Private voting powered by Fully Homomorphic Encryption",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/57671822?s=200&v=4"],
};

// Define local Hardhat network
const hardhatLocal: AppKitNetwork = {
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

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [hardhatLocal, sepolia] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
