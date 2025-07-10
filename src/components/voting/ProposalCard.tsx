"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useHasVoted } from "@/hooks/useProposal";

export interface Proposal {
  id: number;
  description: string;
  deadline: number; // timestamp in seconds
  status: number;
  createdAt: number;
  creator: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  contractAddress: string;
  onVoteClick: (proposalId: number, description: string) => void;
  refreshKey?: number; // Add refresh key to trigger re-fetch
}

export default function ProposalCard({
  proposal,
  contractAddress,
  onVoteClick,
  refreshKey,
}: ProposalCardProps) {
  const { address } = useAccount();

  // Get voting status for this user - will refetch when refreshKey changes
  const { hasVoted, refetch } = useHasVoted(
    contractAddress,
    proposal.id,
    address
  );

  // Refetch voting status when refreshKey changes (after voting)
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  // Calculate time remaining correctly
  const deadlineDate = new Date(Number(proposal.deadline) * 1000); // Convert to milliseconds
  const timeRemaining = Math.max(0, deadlineDate.getTime() - Date.now());
  const isExpired = timeRemaining === 0;

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  // Determine status
  let statusText = "Closed";
  let statusVariant: "default" | "secondary" | "destructive" = "destructive";

  if (proposal.status === 0 && !isExpired) {
    statusText = "Active";
    statusVariant = "default";
  } else if (proposal.status === 1) {
    statusText = "Decryption Requested";
    statusVariant = "secondary";
  } else if (proposal.status === 2) {
    statusText = "Results Available";
    statusVariant = "default";
  }

  const formatTimeRemaining = () => {
    if (isExpired) return "Expired";

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">
            {proposal.description}
          </CardTitle>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </div>
        <CardDescription>Proposal #{proposal.id}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Time remaining:</span>
            <span className="font-medium">{formatTimeRemaining()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Your status:</span>
            <span className="font-medium">
              {hasVoted ? (
                <span className="text-green-600 dark:text-green-400">
                  Voted
                </span>
              ) : (
                <span className="text-gray-500">Not voted</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Created by:</span>
            <span className="font-mono text-xs">
              {proposal.creator.slice(0, 6)}...
              {proposal.creator.slice(-4)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1"
          disabled={proposal.status !== 0 || isExpired || hasVoted}
          onClick={() => onVoteClick(proposal.id, proposal.description)}
        >
          {hasVoted ? "Voted" : "Vote"}
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/proposal/${proposal.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
