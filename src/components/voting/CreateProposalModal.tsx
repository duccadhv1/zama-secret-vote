"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useSecretVote } from "@/hooks/useSecretVote";

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
  const {
    createProposal,
    isCreatingProposal,
    transactionHash,
    transactionError,
    isTransactionConfirmed,
  } = useSecretVote(CONTRACT_ADDRESS);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a proposal description",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert hours to seconds
      const durationInSeconds = parseInt(duration) * 60 * 60;

      // Call the smart contract
      createProposal(description, durationInSeconds);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Create a new voting proposal. All votes will be encrypted and
            private.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Proposal Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what users will be voting on..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="168" // 1 week
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Minimum 1 hour, maximum 1 week
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingProposal}>
              {isCreatingProposal ? "Creating..." : "Create Proposal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalModal;
