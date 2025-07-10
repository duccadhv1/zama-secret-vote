'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';

export interface Proposal {
  id: number;
  description: string;
  deadline: number;
  status: number;
  createdAt: number;
  creator: string;
}

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
  }
] as const;

export const useProposals = (
  contractAddress: string, 
  proposalCount: bigint | undefined, 
  refreshKey?: number
) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();

  const fetchProposals = useCallback(async () => {
    if (!contractAddress || !proposalCount || !publicClient) {
      setProposals([]);
      setIsLoading(false);
      return;
    }

    const count = Number(proposalCount);
    if (count === 0) {
      setProposals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch recent proposals (up to 10 most recent)
      const maxProposals = Math.min(count, 10);
      const startId = Math.max(0, count - maxProposals);
      
      const proposalPromises = [];
      for (let i = startId; i < count; i++) {
        const promise = publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: PROPOSAL_ABI,
          functionName: 'getProposal',
          args: [BigInt(i)],
        });
        proposalPromises.push(promise);
      }

      const results = await Promise.all(proposalPromises);
      
      const fetchedProposals: Proposal[] = results.map((result, index) => ({
        id: startId + index,
        description: result[0],
        deadline: Number(result[1]),
        status: result[2],
        createdAt: Number(result[3]),
        creator: result[4],
      }));

      // Sort by ID descending (most recent first)
      fetchedProposals.sort((a, b) => b.id - a.id);
      
      setProposals(fetchedProposals);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, proposalCount, publicClient]);

  const refetch = useCallback(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals, refreshKey]);

  return { 
    proposals, 
    isLoading,
    error,
    refetch
  };
};
