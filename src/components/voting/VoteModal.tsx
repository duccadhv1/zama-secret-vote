"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useSecretVote } from "@/hooks/useSecretVote";

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: number;
  proposalDescription: string;
  contractAddress: string;
}

const voteOptions = [
  {
    value: 0,
    label: "Strongly Against",
    color: "bg-red-500",
    description: "I completely disagree with this proposal",
  },
  {
    value: 1,
    label: "Against",
    color: "bg-orange-500",
    description: "I disagree with this proposal",
  },
  {
    value: 2,
    label: "For",
    color: "bg-blue-500",
    description: "I agree with this proposal",
  },
  {
    value: 3,
    label: "Strongly For",
    color: "bg-green-500",
    description: "I completely agree with this proposal",
  },
];

export function VoteModal({
  isOpen,
  onClose,
  proposalId,
  proposalDescription,
  contractAddress,
}: VoteModalProps) {
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const { address } = useAccount();
  const {
    vote,
    isVoting,
    transactionError,
    transactionHash,
    isTransactionConfirmed,
  } = useSecretVote(contractAddress);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVote(null);
      setVoteSubmitted(false);
    }
  }, [isOpen]);

  // Handle successful vote
  useEffect(() => {
    if (isTransactionConfirmed && voteSubmitted) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isTransactionConfirmed, voteSubmitted, onClose]);

  const handleVote = async () => {
    if (selectedVote === null) return;

    try {
      setVoteSubmitted(true);
      vote(proposalId, selectedVote);
    } catch (error) {
      console.error("Error voting:", error);
      setVoteSubmitted(false);
    }
  };

  const handleClose = () => {
    if (!isVoting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cast Your Vote</DialogTitle>
          <DialogDescription>
            Choose your position on this proposal. Your vote will be recorded on
            the blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Proposal Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Proposal #{proposalId}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {proposalDescription}
            </p>
          </div>

          {/* Vote Options */}
          {!voteSubmitted ? (
            <div className="space-y-3">
              <h4 className="font-medium">Select your vote:</h4>
              {voteOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVote === option.value
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedVote(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${option.color}`}
                        />
                        <div>
                          <h5 className="font-medium">{option.label}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {selectedVote === option.value && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transaction Status */}
              {isVoting && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Submitting your vote to the blockchain...
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
                    <div className="space-y-2">
                      <p className="font-semibold">
                        Vote successfully recorded!
                      </p>
                      <p>Your vote has been confirmed on the blockchain.</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {transactionError && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <div className="space-y-2">
                      <p className="font-semibold">Error submitting vote</p>
                      <p className="text-sm">{transactionError}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Vote Summary */}
              {selectedVote !== null && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Your Vote</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${voteOptions[selectedVote].color}`}
                    />
                    <span className="font-medium">
                      {voteOptions[selectedVote].label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {transactionError && !voteSubmitted && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="space-y-2">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{transactionError}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isVoting}>
              Cancel
            </Button>
            {!voteSubmitted && (
              <Button
                onClick={handleVote}
                disabled={selectedVote === null || isVoting}
              >
                {isVoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Vote"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
