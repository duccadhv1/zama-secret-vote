"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: number;
}

const VOTE_OPTIONS = [
  { value: "0", label: "Option A", description: "First choice" },
  { value: "1", label: "Option B", description: "Second choice" },
  { value: "2", label: "Option C", description: "Third choice" },
  { value: "3", label: "Option D", description: "Fourth choice" },
];

export const VoteModal = ({ isOpen, onClose, proposalId }: VoteModalProps) => {
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChoice) {
      toast({
        title: "Error",
        description: "Please select a voting option",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would:
      // 1. Encrypt the choice using FhEVM
      // 2. Call the smart contract vote function
      // For now, just simulate the process

      toast({
        title: "Encrypting vote...",
        description: "Please wait while we encrypt your vote",
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Vote submitted!",
        description: "Your encrypted vote has been recorded on-chain",
      });

      setSelectedChoice("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cast Your Vote</DialogTitle>
          <DialogDescription>
            Proposal #{proposalId}. Your vote will be encrypted and kept private
            until results are revealed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Select your choice:</Label>
            <RadioGroup
              value={selectedChoice}
              onValueChange={setSelectedChoice}
              className="space-y-3"
            >
              {VOTE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">🔒</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Privacy Protected
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Your vote will be encrypted using Fully Homomorphic
                  Encryption. No one can see your individual choice until
                  results are decrypted.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedChoice}>
              {isSubmitting
                ? "Encrypting & Submitting..."
                : "Submit Encrypted Vote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
