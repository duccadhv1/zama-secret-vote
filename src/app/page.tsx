"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
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
import { Clock, Users, Vote, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import WalletNotConnected from "@/components/wallet/WalletNotConnected";
import NetworkStatus from "@/components/wallet/NetworkStatus";
import CreateProposalModal from "@/components/voting/CreateProposalModal";
import { VoteModal } from "@/components/voting/VoteModal";
import { useSecretVote } from "@/hooks/useSecretVote";
import { useProposals } from "@/hooks/useProposals";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export default function HomePage() {
  const { isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { proposalCount, isTransactionConfirmed } =
    useSecretVote(CONTRACT_ADDRESS);
  const { proposals, isLoading } = useProposals(
    CONTRACT_ADDRESS,
    proposalCount,
    refreshKey
  );

  // Force refresh proposals when a transaction is confirmed
  useEffect(() => {
    if (isTransactionConfirmed) {
      // Trigger a refresh by updating the key
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 2000); // Wait a bit for the blockchain to update
    }
  }, [isTransactionConfirmed]);

  const handleVoteClick = (proposalId: number, description: string) => {
    setSelectedProposal({ id: proposalId, description });
    setShowVoteModal(true);
  };

  const handleVoteModalClose = () => {
    setShowVoteModal(false);
    setSelectedProposal(null);
    // Trigger refresh after voting
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, 1000);
  };

  if (!isConnected) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">SecretVote</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Private voting powered by Fully Homomorphic Encryption
            </p>
          </div>
          <WalletNotConnected />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <NetworkStatus />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">SecretVote Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and participate in confidential voting
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            Create Proposal
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Proposals
              </CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proposalCount ? Number(proposalCount) : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Proposals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proposals.filter((p) => p.status === 0).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Votes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                FhEVM Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">Ready</div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Proposals</h2>

          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Loading proposals...
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {proposals.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No proposals yet. Be the first to create one!
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      Create First Proposal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proposals.map((proposal) => {
                    const deadlineDate = new Date(proposal.deadline * 1000);
                    const timeRemaining = Math.max(
                      0,
                      deadlineDate.getTime() - Date.now()
                    );
                    const days = Math.floor(
                      timeRemaining / (1000 * 60 * 60 * 24)
                    );
                    const hours = Math.floor(
                      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );

                    let statusText = "Closed";
                    let statusVariant: "default" | "secondary" | "destructive" =
                      "destructive";

                    if (proposal.status === 0) {
                      statusText = "Active";
                      statusVariant = "default";
                    } else if (proposal.status === 1) {
                      statusText = "Pending";
                      statusVariant = "secondary";
                    }

                    return (
                      <Card
                        key={proposal.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-2">
                              {proposal.description}
                            </CardTitle>
                            <Badge variant={statusVariant}>{statusText}</Badge>
                          </div>
                          <CardDescription>
                            Proposal #{proposal.id}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Time remaining:
                              </span>
                              <span className="font-medium">
                                {timeRemaining > 0
                                  ? `${days}d ${hours}h`
                                  : "Expired"}
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
                            disabled={proposal.status !== 0}
                            onClick={() =>
                              handleVoteClick(proposal.id, proposal.description)
                            }
                          >
                            Vote
                          </Button>
                          <Button variant="outline" asChild className="flex-1">
                            <Link href={`/proposal/${proposal.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-2">
              🚧 SecretVote is under development
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This demo showcases the UI. Full FHE voting functionality coming
              soon!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Contract Address: {CONTRACT_ADDRESS || "Not deployed"}
            </p>
          </div>
        </motion.div>

        {/* Create Proposal Modal */}
        <CreateProposalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />

        {/* Vote Modal */}
        {selectedProposal && (
          <VoteModal
            isOpen={showVoteModal}
            onClose={handleVoteModalClose}
            proposalId={selectedProposal.id}
            proposalDescription={selectedProposal.description}
            contractAddress={CONTRACT_ADDRESS}
          />
        )}
      </div>
    </PageTransition>
  );
}
