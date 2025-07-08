"use client";

import { useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/wallet/useWallet";

export default function NetworkStatus() {
  const chainId = useChainId();
  const { isConnected, switchNetwork, supportedNetworks } = useWallet();

  const getCurrentNetwork = () => {
    switch (chainId) {
      case 31337:
        return { name: "Hardhat Local", color: "bg-green-500", isLocal: true };
      case 11155111:
        return { name: "Sepolia", color: "bg-blue-500", isLocal: false };
      default:
        return { name: "Unknown", color: "bg-gray-500", isLocal: false };
    }
  };

  const currentNetwork = getCurrentNetwork();

  if (!isConnected) {
    return (
      <Alert>
        <AlertDescription>
          Please connect your wallet to see network status.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Current Network:</span>
        <Badge className={`${currentNetwork.color} text-white`}>
          {currentNetwork.name} (Chain ID: {chainId})
        </Badge>
      </div>

      {currentNetwork.isLocal ? (
        <Alert>
          <AlertDescription className="text-green-800">
            ✅ Connected to Hardhat Local network. Perfect for development!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription className="text-amber-800">
            ⚠️ You're on {currentNetwork.name}. For local development, please
            switch to Hardhat Local network.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 flex-wrap">
        {supportedNetworks.map((network) => (
          <Button
            key={network.id}
            variant={chainId === network.id ? "default" : "outline"}
            size="sm"
            onClick={() => switchNetwork(network)}
            disabled={chainId === network.id}
          >
            {network.name}
          </Button>
        ))}
      </div>

      {currentNetwork.isLocal && (
        <div className="text-xs text-gray-600">
          <p>💡 Local network benefits:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Fast transactions</li>
            <li>No gas costs</li>
            <li>10,000 ETH test balance</li>
            <li>Perfect for testing SecretVote features</li>
          </ul>
        </div>
      )}
    </div>
  );
}
