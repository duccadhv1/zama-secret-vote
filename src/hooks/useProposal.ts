'use client';

import { useReadContract } from 'wagmi';

const PROPOSAL_ABI = [
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
    "name": "getResults",
    "outputs": [{"internalType": "uint64[4]", "name": "counts", "type": "uint64[4]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface ProposalData {
  id: number;
  description: string;
  deadline: bigint;
  status: number;
  createdAt: bigint;
  creator: string;
}

export interface ProposalResults {
  counts: [bigint, bigint, bigint, bigint];
}

export interface ProposalResultsHook {
  results: ProposalResults | undefined;
  isLoading: boolean;
  error: any;
  canFetchResults: boolean;
}

export const useProposal = (contractAddress: string, proposalId: number) => {
  // Get proposal data
  const { data: proposalData, isLoading: isLoadingProposal, error: proposalError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PROPOSAL_ABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
    query: {
      enabled: !!contractAddress && proposalId >= 0,
    }
  });

  const proposal: ProposalData | undefined = proposalData ? {
    id: proposalId,
    description: proposalData[0],
    deadline: proposalData[1],
    status: proposalData[2],
    createdAt: proposalData[3],
    creator: proposalData[4]
  } : undefined;

  return {
    proposal,
    isLoading: isLoadingProposal,
    error: proposalError
  };
};

export const useHasVoted = (contractAddress: string, proposalId: number, voterAddress?: string) => {
  const { data: hasVoted, isLoading, error, refetch } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PROPOSAL_ABI,
    functionName: 'getHasVoted',
    args: [BigInt(proposalId), voterAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && proposalId >= 0 && !!voterAddress,
      staleTime: 0, // Always fetch fresh data for voting status
    }
  });

  return {
    hasVoted: hasVoted || false,
    isLoading,
    error,
    refetch
  };
};

export const useProposalResults = (contractAddress: string, proposalId: number, proposal?: ProposalData) => {
  // Only enable the query if proposal exists and either:
  // 1. Current time is past deadline, OR
  // 2. Status is Decrypted (2)
  const canFetchResults = proposal && (
    Date.now() / 1000 >= Number(proposal.deadline) || 
    proposal.status === 2
  );

  const { data: resultsData, isLoading, error, refetch } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PROPOSAL_ABI,
    functionName: 'getResults',
    args: [BigInt(proposalId)],
    query: {
      enabled: !!contractAddress && proposalId >= 0 && canFetchResults,
      retry: (failureCount, error) => {
        // Don't retry if it's the expected "Results not available" error
        if (error?.message?.includes('Results not available')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 30000, // Cache for 30 seconds
      refetchInterval: canFetchResults ? false : undefined, // Don't auto-refetch when disabled
    }
  });

  const results: ProposalResults | undefined = resultsData ? {
    counts: resultsData as [bigint, bigint, bigint, bigint]
  } : undefined;

  return {
    results,
    isLoading: canFetchResults ? isLoading : false, // Don't show loading if we can't fetch
    error: canFetchResults ? error : null, // Don't show error if we're not supposed to fetch
    canFetchResults, // Export this so components can know if results are available
    refetch, // Export refetch function
  };
};
