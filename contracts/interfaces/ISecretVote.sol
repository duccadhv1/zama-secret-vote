// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISecretVote {
    enum VotingStatus {
        Open,
        DecryptionRequested,
        Decrypted
    }

    struct ProposalInfo {
        string description;
        uint256 deadline;
        VotingStatus status;
        uint256 createdAt;
        address creator;
    }

    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        uint256 deadline,
        address indexed creator
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter
    );
    
    event DecryptionRequested(
        uint256 indexed proposalId,
        uint256 requestId
    );
    
    event ProposalDecrypted(
        uint256 indexed proposalId,
        uint64[4] counts
    );

    function createProposal(string memory description, uint256 duration) external returns (uint256);
    
    function vote(uint256 proposalId, bytes memory encryptedChoice, bytes memory inputProof) external;
    
    function requestDecryption(uint256 proposalId) external;
    
    function getResults(uint256 proposalId) external view returns (uint64[4] memory);
    
    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 deadline,
        VotingStatus status,
        uint256 createdAt,
        address creator
    );
    
    function getProposalCount() external view returns (uint256);
    
    function getHasVoted(uint256 proposalId, address voter) external view returns (bool);
    
    function getVotingStatus(uint256 proposalId) external view returns (VotingStatus);
}
