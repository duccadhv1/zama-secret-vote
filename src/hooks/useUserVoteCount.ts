'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useHasVoted } from './useProposal';

export const useUserVoteCount = (
  contractAddress: string,
  proposals: Array<{ id: number }>,
  refreshKey?: number
) => {
  const { address } = useAccount();
  const [userVoteCount, setUserVoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Create fixed hooks for up to 5 proposals to avoid dynamic hook calls
  const hasVoted0 = useHasVoted(
    contractAddress,
    proposals[0]?.id ?? -1,
    address
  );
  const hasVoted1 = useHasVoted(
    contractAddress,
    proposals[1]?.id ?? -1,
    address
  );
  const hasVoted2 = useHasVoted(
    contractAddress,
    proposals[2]?.id ?? -1,
    address
  );
  const hasVoted3 = useHasVoted(
    contractAddress,
    proposals[3]?.id ?? -1,
    address
  );
  const hasVoted4 = useHasVoted(
    contractAddress,
    proposals[4]?.id ?? -1,
    address
  );

  const hasVotedQueries = [hasVoted0, hasVoted1, hasVoted2, hasVoted3, hasVoted4];

  useEffect(() => {
    if (!address || proposals.length === 0) {
      setUserVoteCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Check if all enabled queries are completed
    const enabledQueries = hasVotedQueries.slice(0, proposals.length);
    const allCompleted = enabledQueries.every(query => !query.isLoading);

    if (allCompleted) {
      const voteCount = enabledQueries.reduce((count, query) => {
        return count + (query.hasVoted ? 1 : 0);
      }, 0);

      setUserVoteCount(voteCount);
      setIsLoading(false);
    }
  }, [
    address,
    proposals.length,
    ...hasVotedQueries.map(q => q.hasVoted),
    ...hasVotedQueries.map(q => q.isLoading)
  ]);

  // Refetch all voting statuses when refreshKey changes
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      [hasVoted0, hasVoted1, hasVoted2, hasVoted3, hasVoted4].forEach(query => {
        if (query.refetch) {
          query.refetch();
        }
      });
    }
  }, [refreshKey, hasVoted0.refetch, hasVoted1.refetch, hasVoted2.refetch, hasVoted3.refetch, hasVoted4.refetch]);

  return {
    userVoteCount,
    isLoading: isLoading || hasVotedQueries.some(q => q.isLoading)
  };
};
