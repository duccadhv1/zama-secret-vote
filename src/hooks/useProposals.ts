'use client';

import { useState, useEffect } from 'react';
import { readContract } from 'wagmi/actions';
import { config } from '@/config';

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

export interface Proposal {
  id: number;
  description: string;
  deadline: number;
  status: number;
  createdAt: number;
  creator: `0x${string}`;
}

export const useProposals = (
  contractAddress: string, 
  proposalCount: bigint | undefined, 
  refreshKey?: number
) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!proposalCount || Number(proposalCount) === 0 || !contractAddress) {
        setProposals([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const proposalPromises = Array.from({ length: Number(proposalCount) }, async (_, i) => {
          try {
            const result = await readContract(config, {
              address: contractAddress as `0x${string}`,
              abi: PROPOSAL_ABI,
              functionName: 'getProposal',
              args: [BigInt(i)],
            });

            const [description, deadline, status, createdAt, creator] = result;
            return {
              id: i,
              description,
              deadline: Number(deadline),
              status: Number(status),
              createdAt: Number(createdAt),
              creator,
            };
          } catch (error) {
            console.error(`Error fetching proposal ${i}:`, error);
            return null;
          }
        });

        const fetchedProposals = await Promise.all(proposalPromises);
        const validProposals = fetchedProposals.filter(p => p !== null) as Proposal[];
        setProposals(validProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setProposals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [contractAddress, proposalCount, refreshKey]);

  return { proposals, isLoading };
};
