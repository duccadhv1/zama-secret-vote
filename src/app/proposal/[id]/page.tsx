"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Clock,
  User,
  Vote,
  BarChart3,
  Calendar,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import WalletNotConnected from "@/components/wallet/WalletNotConnected";
import { VoteModal } from "@/components/voting/VoteModal";
import { useSecretVote } from "@/hooks/useSecretVote";
import {
  useProposal,
  useHasVoted,
  useProposalResults,
} from "@/hooks/useProposal";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [showVoteModal, setShowVoteModal] = useState(false);

  const proposalId = parseInt(params.id as string);

  // Use hooks to get real data from contract
  const {
    proposal,
    isLoading: isLoadingProposal,
    error: proposalError,
  } = useProposal(CONTRACT_ADDRESS, proposalId);
  const {
    hasVoted,
    isLoading: isLoadingHasVoted,
    refetch: refetchHasVoted,
  } = useHasVoted(CONTRACT_ADDRESS, proposalId, address);
  const {
    results,
    isLoading: isLoadingResults,
    canFetchResults,
    refetch: refetchResults,
  } = useProposalResults(
    CONTRACT_ADDRESS,
    proposalId,
    proposal // Pass proposal data so hook can check deadline
  );

  const {
    requestDecryption,
    isRequestingDecryption,
    transactionError,
    isTransactionConfirmed,
  } = useSecretVote(CONTRACT_ADDRESS);

  // Separate loading states - don't include results loading in main loading
  // because results might not be available yet and that's expected
  const isLoading = isLoadingProposal || isLoadingHasVoted;

  console.log("🚀 ~ ProposalDetailPage ~ Loading states:", {
    isLoadingProposal,
    isLoadingHasVoted,
    isLoadingResults,
    canFetchResults,
  });

  const handleVoteModalClose = () => {
    setShowVoteModal(false);
    // Refetch voting status immediately after voting
    refetchHasVoted();
  };

  // Refetch results when decryption transaction is confirmed
  useEffect(() => {
    if (isTransactionConfirmed) {
      // Refetch proposal data and results after decryption
      setTimeout(() => {
        refetchResults();
      }, 1000); // Small delay to ensure blockchain state is updated
    }
  }, [isTransactionConfirmed, refetchResults]);

  const handleRequestDecryption = () => {
    try {
      requestDecryption(proposalId);
    } catch (error) {
      console.error("Error requesting decryption:", error);
    }
  };

  // Handle loading states
  if (!isConnected) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <WalletNotConnected />
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-lg">Loading proposal details...</p>
              <p className="text-sm text-gray-500">
                Fetching data from blockchain
              </p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (proposalError || !proposal) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold">Proposal Not Found</h1>
              <p className="text-gray-600">
                {proposalError
                  ? "Error loading proposal data from the contract."
                  : "The proposal you're looking for doesn't exist or hasn't been created yet."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>

            {proposalError && (
              <Alert className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {proposalError.message || "Failed to fetch proposal data"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  // Calculate time-related values
  const deadlineDate = new Date(Number(proposal.deadline) * 1000);
  const createdDate = new Date(Number(proposal.createdAt) * 1000);
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

  // Vote-related constants
  const totalVotes = results
    ? results.counts.reduce((sum, count) => sum + count, BigInt(0))
    : BigInt(0);
  const voteLabels = ["Strongly Against", "Against", "For", "Strongly For"];
  const voteColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
  ];
  const voteDescriptions = [
    "Complete disagreement with the proposal",
    "General disagreement with the proposal",
    "General agreement with the proposal",
    "Complete agreement with the proposal",
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mb-6 mt-16"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Proposal #{proposal.id}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant} className="text-sm px-3 py-1">
                    {statusText}
                  </Badge>
                  {!isExpired && proposal.status === 0 && (
                    <Badge variant="outline" className="text-sm">
                      <Clock className="mr-1 h-3 w-3" />
                      {days}d {hours}h remaining
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Proposal Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Vote className="h-6 w-6" />
                    Proposal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Description</h3>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {proposal.description}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        Created
                      </div>
                      <p className="text-sm font-mono">
                        {createdDate.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        Deadline
                      </div>
                      <p className="text-sm font-mono">
                        {deadlineDate.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        Creator
                      </div>
                      <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {proposal.creator.slice(0, 8)}...
                        {proposal.creator.slice(-6)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <UserCheck className="h-4 w-4" />
                        Your Status
                      </div>
                      <div className="text-sm">
                        {hasVoted ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Voted
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Not voted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Voting Results */}
            {canFetchResults ? (
              results ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <BarChart3 className="h-6 w-6" />
                        Voting Results
                      </CardTitle>
                      <CardDescription className="text-base">
                        Total votes cast:{" "}
                        <span className="font-semibold">
                          {totalVotes.toString()}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {results.counts.map((count, index) => {
                          const percentage =
                            totalVotes > 0
                              ? (Number(count) / Number(totalVotes)) * 100
                              : 0;

                          return (
                            <div key={index} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full ${voteColors[index]}`}
                                  />
                                  <div>
                                    <span className="font-medium text-base">
                                      {voteLabels[index]}
                                    </span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {voteDescriptions[index]}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold">
                                    {count.toString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-3" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : isLoadingResults ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <BarChart3 className="h-6 w-6" />
                        Voting Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            Loading results...
                          </p>
                          <p className="text-sm text-gray-500">
                            Fetching decrypted vote data
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <BarChart3 className="h-6 w-6" />
                        Voting Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-full p-4 w-fit mx-auto">
                          <AlertCircle className="h-12 w-12 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">
                            Results Not Available Yet
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            The voting period has ended, but the results haven't
                            been decrypted yet. Someone needs to request
                            decryption to reveal the results.
                          </p>
                        </div>
                        {proposal.status === 0 && (
                          <Button
                            onClick={handleRequestDecryption}
                            disabled={isRequestingDecryption}
                            className="mt-4"
                          >
                            {isRequestingDecryption ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Requesting Decryption...
                              </>
                            ) : (
                              <>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Request Results Decryption
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ) : (
              // When results can't be fetched yet (proposal still active)
              proposal.status === 0 &&
              !isExpired && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <BarChart3 className="h-6 w-6" />
                        Voting Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-4 w-fit mx-auto">
                          <Clock className="h-12 w-12 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">
                            Voting in Progress
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Results will be available after the voting period
                            ends and the votes are decrypted. Keep your vote
                            private!
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 mt-4">
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {days}d {hours}h {minutes}m remaining
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}

            {/* How Voting Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    How SecretVote Works
                  </CardTitle>
                  <CardDescription>
                    Understanding the privacy features and voting process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Vote Options</h4>
                      <div className="space-y-3">
                        {voteLabels.map((label, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div
                              className={`w-4 h-4 rounded-full ${voteColors[index]} mt-0.5`}
                            />
                            <div>
                              <span className="font-medium">{label}</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {voteDescriptions[index]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">
                        Privacy Features
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-blue-900 dark:text-blue-100">
                              Encrypted Votes
                            </span>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              Individual votes are encrypted and remain private
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-green-900 dark:text-green-100">
                              FHE Technology
                            </span>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              Uses Fully Homomorphic Encryption for computation
                              on encrypted data
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <span className="font-medium text-purple-900 dark:text-purple-100">
                              Decrypted Results
                            </span>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                              Results revealed only after voting ends via
                              decryption request
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Time Remaining */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isExpired ? (
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 dark:text-red-400 font-semibold">
                        Voting has ended
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {days}d {hours}h {minutes}m
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Until voting closes
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Days:</span>
                          <span className="font-mono">{days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hours:</span>
                          <span className="font-mono">{hours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minutes:</span>
                          <span className="font-mono">{minutes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Vote Action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Vote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hasVoted ? (
                      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                          Vote Successfully Submitted
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Your encrypted vote has been recorded on the
                          blockchain and cannot be changed.
                        </p>
                      </div>
                    ) : (
                      <>
                        {!isExpired && proposal.status === 0 ? (
                          <div className="space-y-3">
                            <Button
                              onClick={() => setShowVoteModal(true)}
                              className="w-full h-12 text-base"
                              size="lg"
                            >
                              <Vote className="mr-2 h-5 w-5" />
                              Cast Your Vote
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                              Your vote will be encrypted and stored securely
                            </p>
                          </div>
                        ) : (
                          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              Voting is no longer available
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              The voting period has ended
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Request Decryption Button */}
                    {isExpired && proposal.status === 0 && (
                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleRequestDecryption}
                          variant="outline"
                          className="w-full"
                          disabled={isRequestingDecryption}
                        >
                          {isRequestingDecryption ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Requesting...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Request Results
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Decrypt votes to reveal results
                        </p>
                      </div>
                    )}

                    {/* Transaction Error */}
                    {transactionError && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                          {transactionError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Proposal ID</span>
                    <span className="font-mono text-sm">#{proposal.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Votes</span>
                    <span className="font-semibold">
                      {totalVotes.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status</span>
                    <Badge variant={statusVariant} className="text-xs">
                      {statusText}
                    </Badge>
                  </div>
                  {results && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 mb-2">
                        Vote Distribution
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {voteLabels.map((label, index) => {
                          const count = results.counts[index];
                          const percentage =
                            totalVotes > 0
                              ? (Number(count) / Number(totalVotes)) * 100
                              : 0;

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${voteColors[index]}`}
                              />
                              <span className="truncate">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Vote Modal */}
        <VoteModal
          isOpen={showVoteModal}
          onClose={handleVoteModalClose}
          proposalId={proposal.id}
          proposalDescription={proposal.description}
          contractAddress={CONTRACT_ADDRESS}
        />
      </div>
    </PageTransition>
  );
}
