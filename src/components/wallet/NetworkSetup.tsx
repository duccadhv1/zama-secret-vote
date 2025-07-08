"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Info } from "lucide-react";

export default function NetworkSetup() {
  const [copied, setCopied] = useState<string | null>(null);

  const networkConfig = {
    networkName: "Hardhat Local",
    rpcUrl: "http://localhost:8545",
    rpcUrlAlt: "http://127.0.0.1:8545",
    chainId: "31337",
    currencySymbol: "ETH",
    blockExplorer: "",
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const addToMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // First try to switch to the network if it already exists
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }], // 31337 in hex
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x7A69", // 31337 in hex
                  chainName: networkConfig.networkName,
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: networkConfig.currencySymbol,
                    decimals: 18,
                  },
                  rpcUrls: [networkConfig.rpcUrl],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add network:", addError);
            // Show user-friendly error message
            alert(
              "Failed to add network to MetaMask. For local development, you may need to manually add the network with HTTP RPC URL. Some MetaMask versions require HTTPS URLs."
            );
          }
        } else {
          console.error("Failed to switch network:", switchError);
        }
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Network Setup
        </CardTitle>
        <CardDescription>
          Add Hardhat Local network to your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            To use SecretVote locally, add the Hardhat network to your wallet.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Network Name:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {networkConfig.networkName}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(networkConfig.networkName, "name")
                }
              >
                {copied === "name" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">RPC URL:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {networkConfig.rpcUrl}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(networkConfig.rpcUrl, "rpc")}
              >
                {copied === "rpc" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Alt RPC URL:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {networkConfig.rpcUrlAlt}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(networkConfig.rpcUrlAlt, "rpcAlt")
                }
              >
                {copied === "rpcAlt" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Chain ID:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {networkConfig.chainId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(networkConfig.chainId, "chain")}
              >
                {copied === "chain" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Currency:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {networkConfig.currencySymbol}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(networkConfig.currencySymbol, "currency")
                }
              >
                {copied === "currency" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={addToMetaMask} className="w-full">
            Add to MetaMask
          </Button>

          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              window.open(
                "https://support.metamask.io/managing-my-wallet/using-metamask/how-to-add-a-custom-network-rpc/",
                "_blank"
              );
            }}
          >
            📖 Manual Setup Guide
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Troubleshooting:</strong>
            <br />
            • If automatic setup fails, manually add the network in MetaMask
            <br />
            • Try using "localhost:8545" instead of "127.0.0.1:8545"
            <br />
            • Some MetaMask versions require HTTPS URLs for security
            <br />• For local development, HTTP URLs should work in most cases
          </AlertDescription>
        </Alert>

        <p className="text-xs text-gray-500 text-center">
          Make sure your Hardhat node is running on port 8545
        </p>
      </CardContent>
    </Card>
  );
}
