import React from "react";
import { useReadContract } from "wagmi";

const PROPOSAL_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "getProposal",
    outputs: [
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      {
        internalType: "enum SecretVote.VotingStatus",
        name: "status",
        type: "uint8",
      },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface ProposalFetcherProps {
  contractAddress: string;
  proposalId: number;
  onProposalFetched: (id: number, proposal: any) => void;
}

export const ProposalFetcher = ({
  contractAddress,
  proposalId,
  onProposalFetched,
}: ProposalFetcherProps) => {
  const {
    data: proposalData,
    isError,
    isLoading,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PROPOSAL_ABI,
    functionName: "getProposal",
    args: [BigInt(proposalId)],
  });

  React.useEffect(() => {
    if (proposalData && !isError && !isLoading) {
      const [description, deadline, status, createdAt, creator] = proposalData;
      onProposalFetched(proposalId, {
        id: proposalId,
        description,
        deadline: Number(deadline),
        status: Number(status),
        createdAt: Number(createdAt),
        creator,
      });
    }
  }, [proposalData, isError, isLoading, proposalId, onProposalFetched]);

  return null; // This component doesn't render anything
};
