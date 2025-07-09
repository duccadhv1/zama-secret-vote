'use client';

import { useState, useEffect } from 'react';
import { useProposal } from './useProposal';

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
        // For now, create mock proposals since we can't call multiple useProposal hooks dynamically
        // In a real implementation, you'd need to restructure this differently
        const mockProposals: Proposal[] = Array.from({ length: Number(proposalCount) }, (_, i) => ({
          id: i,
          description: `Proposal ${i}: Sample governance proposal for testing the voting system`,
          deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
          status: 0, // Active
          createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          creator: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        }));

        setProposals(mockProposals);
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
