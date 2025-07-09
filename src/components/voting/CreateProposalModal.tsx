"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSecretVote } from "@/hooks/useSecretVote";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProposalModal = ({
  isOpen,
  onClose,
}: CreateProposalModalProps) => {
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("24"); // hours
  const { toast } = useToast();
  const { isConnected, address } = useAccount();

  const {
    createProposal,
    isCreatingProposal,
    transactionHash,
    transactionError,
    isTransactionConfirmed,
  } = useSecretVote(CONTRACT_ADDRESS);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("=== CreateProposalModal opened ===");
      console.log("Wallet connected:", isConnected);
      console.log("Wallet address:", address);
      console.log("Contract address:", CONTRACT_ADDRESS);
      console.log("Hook state:", {
        isCreatingProposal,
        transactionHash,
        transactionError,
        isTransactionConfirmed,
      });
    }
  }, [
    isOpen,
    isConnected,
    address,
    isCreatingProposal,
    transactionHash,
    transactionError,
    isTransactionConfirmed,
  ]);

  // Watch for transaction completion
  useEffect(() => {
    if (isTransactionConfirmed && transactionHash) {
      toast({
        title: "Success",
        description: "Proposal created successfully!",
      });

      // Reset form and close modal
      setDescription("");
      setDuration("24");
      onClose();
    }
  }, [isTransactionConfirmed, transactionHash, onClose, toast]);

  // Show error if transaction fails
  useEffect(() => {
    if (transactionError) {
      toast({
        title: "Error",
        description: transactionError,
        variant: "destructive",
      });
    }
  }, [transactionError, toast]);

  // Reset submitting state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset any error states when modal opens
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== Create Proposal Debug ===");
    console.log("Form submitted with:", { description, duration });
    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("Wallet connected:", isConnected);
    console.log("Wallet address:", address);
    console.log("Hook state:", {
      isCreatingProposal,
      transactionHash,
      transactionError,
    });

    if (!isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Error",
        description: "Wallet address not available",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a proposal description",
        variant: "destructive",
      });
      return;
    }

    if (!CONTRACT_ADDRESS) {
      toast({
        title: "Error",
        description: "Contract address not configured",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert hours to seconds
      const durationInSeconds = parseInt(duration) * 60 * 60;

      console.log("About to call createProposal with params:", {
        description,
        durationInSeconds,
        contractAddress: CONTRACT_ADDRESS,
        walletAddress: address,
      });

      // Call the smart contract
      createProposal(description, durationInSeconds);

      console.log("createProposal function called - waiting for MetaMask...");
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Create a new voting proposal. All votes will be encrypted and
            private using Fully Homomorphic Encryption.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Status */}
          {!isConnected && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Please connect your wallet to create a proposal.
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Status */}
          {isCreatingProposal && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Please confirm the transaction in MetaMask...</p>
                  <p className="text-xs text-gray-500">
                    This may take a moment to process on the blockchain.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {transactionHash && !isTransactionConfirmed && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Transaction submitted! Waiting for confirmation...</p>
                  <p className="text-xs font-mono">
                    Hash: {transactionHash.slice(0, 10)}...
                    {transactionHash.slice(-8)}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isTransactionConfirmed && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Proposal created successfully!
              </AlertDescription>
            </Alert>
          )}

          {transactionError && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="space-y-2">
                  <p className="font-semibold">Transaction failed</p>
                  <p className="text-sm">{transactionError}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Proposal Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what users will be voting on. Be clear and specific about what you're proposing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              disabled={isCreatingProposal}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Provide a clear description of what voters are deciding on.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (hours) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="168" // 1 week
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              disabled={isCreatingProposal}
            />
            <p className="text-sm text-gray-500">
              Minimum 1 hour, maximum 1 week (168 hours)
            </p>
          </div>

          {!CONTRACT_ADDRESS && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Contract address is not configured. Please check your
                environment variables.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreatingProposal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isCreatingProposal ||
                !CONTRACT_ADDRESS ||
                !description.trim() ||
                !isConnected
              }
            >
              {(() => {
                if (isCreatingProposal) {
                  return (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  );
                }
                if (!isConnected) {
                  return "Connect Wallet First";
                }
                return "Create Proposal";
              })()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalModal;
