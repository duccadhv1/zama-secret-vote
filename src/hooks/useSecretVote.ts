'use client';

import { useEffect, useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const SECRET_VOTE_ABI = [
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "getProposal",
    "outputs": [
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"},
      {"internalType": "enum SecretVote.VotingStatus", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "address", "name": "creator", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "getHasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "getVotingStatus",
    "outputs": [{"internalType": "enum SecretVote.VotingStatus", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "getResults",
    "outputs": [{"internalType": "uint64[4]", "name": "counts", "type": "uint64[4]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "createProposal",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"internalType": "uint8", "name": "choice", "type": "uint8"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "requestDecryption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export enum VotingStatus {
  Open = 0,
  DecryptionRequested = 1,
  Decrypted = 2
}

export interface Proposal {
  description: string;
  deadline: bigint;
  status: VotingStatus;
  createdAt: bigint;
  creator: string;
}

export interface ProposalResults {
  counts: [bigint, bigint, bigint, bigint];
}

interface UseSecretVoteReturn {
  // Read functions
  proposalCount: bigint | undefined;
  getProposal: (id: number) => Proposal | undefined;
  getHasVoted: (proposalId: number, voter: string) => boolean | undefined;
  getVotingStatus: (proposalId: number) => VotingStatus | undefined;
  getResults: (proposalId: number) => ProposalResults | undefined;
  
  // Write functions
  createProposal: (description: string, duration: number) => void;
  vote: (proposalId: number, choice: number) => void;
  requestDecryption: (proposalId: number) => void;
  
  // Transaction states
  isCreatingProposal: boolean;
  isVoting: boolean;
  isRequestingDecryption: boolean;
  transactionError: string | null;
  transactionHash: string | null;
  isTransactionConfirmed: boolean;
}

export const useSecretVote = (contractAddress: string): UseSecretVoteReturn => {
  // Read proposal count
  const { data: proposalCount, refetch: refetchProposalCount } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: SECRET_VOTE_ABI,
    functionName: 'getProposalCount',
  });

  // Write contract hook
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  // Wait for transaction
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get proposal by ID - placeholder for now, will be replaced with proper hooks
  const getProposal = useCallback((id: number): Proposal | undefined => {
    // This function is now just a placeholder
    // Real data fetching is handled in separate hooks
    return undefined;
  }, [contractAddress]);

  // Get voting status for user - placeholder for now, will be replaced with proper hooks  
  const getHasVoted = useCallback((proposalId: number, voter: string): boolean | undefined => {
    // This function is now just a placeholder
    // Real data fetching is handled in separate hooks
    return undefined;
  }, []);

  // Get voting status
  const getVotingStatus = useCallback((proposalId: number): VotingStatus | undefined => {
    try {
      // This would fetch from contract
      return VotingStatus.Open;
    } catch (error) {
      console.error("Error getting voting status:", error);
      return undefined;
    }
  }, []);

  // Get results
  const getResults = useCallback((proposalId: number): ProposalResults | undefined => {
    try {
      // This would fetch from contract
      // Return mock results for testing
      return {
        counts: [BigInt(10), BigInt(5), BigInt(20), BigInt(15)]
      };
    } catch (error) {
      console.error("Error getting results:", error);
      return undefined;
    }
  }, []);

  // Create proposal
  const createProposal = useCallback((description: string, duration: number): void => {
    console.log("🚀 ~ createProposal ~ Starting createProposal function");
    console.log("Contract Address:", contractAddress);
    console.log("Description:", description);
    console.log("Duration:", duration);
    
    if (!contractAddress) {
      console.error("Contract address is not defined");
      return;
    }
    
    try {
      console.log("Calling writeContract...");
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: SECRET_VOTE_ABI,
        functionName: 'createProposal' as const,
        args: [description, BigInt(duration)],
      });
      console.log("writeContract called successfully - MetaMask should prompt now");
    } catch (error) {
      console.error("Error in writeContract:", error);
    }
  }, [contractAddress, writeContract]);

  // Vote on proposal
  const vote = useCallback((proposalId: number, choice: number) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: SECRET_VOTE_ABI,
      functionName: 'vote',
      args: [BigInt(proposalId), choice],
    });
  }, [contractAddress, writeContract]);

  // Request decryption
  const requestDecryption = useCallback((proposalId: number) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: SECRET_VOTE_ABI,
      functionName: 'requestDecryption',
      args: [BigInt(proposalId)],
    });
  }, [contractAddress, writeContract]);

  // Refresh data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      // Small delay to ensure blockchain state is updated
      setTimeout(() => {
        refetchProposalCount();
      }, 1000);
    }
  }, [isConfirmed, refetchProposalCount]);

  return {
    // Read data
    proposalCount,
    getProposal,
    getHasVoted,
    getVotingStatus,
    getResults,
    
    // Write functions
    createProposal,
    vote,
    requestDecryption,
    
    // Transaction states
    isCreatingProposal: isPending,
    isVoting: isPending,
    isRequestingDecryption: isPending,
    transactionError: error?.message ?? null,
    transactionHash: hash ?? null,
    isTransactionConfirmed: isConfirmed,
  };
};
