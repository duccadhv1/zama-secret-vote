// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SecretVote
 * @dev A voting system (simplified version without FHE for now)
 * @author SecretVote Team
 */
contract SecretVote is Ownable, ReentrancyGuard {
    enum VotingStatus {
        Open,
        DecryptionRequested,
        Decrypted
    }

    struct Proposal {
        string description;
        uint256 deadline;
        uint64[4] counts; // Support up to 4 choices (0-3)
        VotingStatus status;
        uint256 createdAt;
        address creator;
    }

    // State variables
    uint256 public proposalCounter;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256) public decryptionRequests;

    // Events
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

    // Modifiers
    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCounter, "Proposal does not exist");
        _;
    }

    modifier onlyWhenOpen(uint256 proposalId) {
        require(proposals[proposalId].status == VotingStatus.Open, "Voting is not open");
        require(block.timestamp < proposals[proposalId].deadline, "Voting has ended");
        _;
    }

    modifier hasNotVoted(uint256 proposalId) {
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        _;
    }

    modifier onlyAfterDeadline(uint256 proposalId) {
        require(block.timestamp >= proposals[proposalId].deadline, "Voting still active");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new proposal
     * @param description The description of the proposal
     * @param duration Duration in seconds from now
     */
    function createProposal(
        string memory description,
        uint256 duration
    ) external returns (uint256) {
        require(duration > 0, "Duration must be positive");
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 proposalId = proposalCounter++;
        uint256 deadline = block.timestamp + duration;

        Proposal storage newProposal = proposals[proposalId];
        newProposal.description = description;
        newProposal.deadline = deadline;
        newProposal.status = VotingStatus.Open;
        newProposal.createdAt = block.timestamp;
        newProposal.creator = msg.sender;

        // Initialize counts to 0
        for (uint8 i = 0; i < 4; i++) {
            newProposal.counts[i] = 0;
        }

        emit ProposalCreated(proposalId, description, deadline, msg.sender);
        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal (simplified without encryption)
     * @param proposalId The ID of the proposal
     * @param choice Choice (0-3)
     */
    function vote(
        uint256 proposalId,
        uint8 choice
    ) 
        external
        proposalExists(proposalId)
        onlyWhenOpen(proposalId)
        hasNotVoted(proposalId)
        nonReentrant
    {
        require(choice < 4, "Invalid choice");

        // Mark as voted
        hasVoted[proposalId][msg.sender] = true;

        // Update counts
        proposals[proposalId].counts[choice]++;

        emit VoteCast(proposalId, msg.sender);
    }

    /**
     * @dev Request decryption of results after deadline (simplified)
     * @param proposalId The ID of the proposal
     */
    function requestDecryption(uint256 proposalId)
        external
        proposalExists(proposalId)
        onlyAfterDeadline(proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == VotingStatus.Open, "Decryption already requested or completed");

        proposal.status = VotingStatus.Decrypted; // Simplified - immediately set as decrypted

        emit ProposalDecrypted(proposalId, proposal.counts);
    }

    /**
     * @dev Get the results of a proposal
     * @param proposalId The ID of the proposal
     * @return counts Array of vote counts for each choice
     */
    function getResults(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (uint64[4] memory counts)
    {
        require(proposals[proposalId].status == VotingStatus.Decrypted, "Results not available");
        return proposals[proposalId].counts;
    }

    /**
     * @dev Get proposal details
     * @param proposalId The ID of the proposal
     */
    function getProposal(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (
            string memory description,
            uint256 deadline,
            VotingStatus status,
            uint256 createdAt,
            address creator
        )
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.description,
            proposal.deadline,
            proposal.status,
            proposal.createdAt,
            proposal.creator
        );
    }

    /**
     * @dev Get total number of proposals
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCounter;
    }

    /**
     * @dev Check if an address has voted on a proposal
     */
    function getHasVoted(uint256 proposalId, address voter)
        external
        view
        proposalExists(proposalId)
        returns (bool)
    {
        return hasVoted[proposalId][voter];
    }

    /**
     * @dev Get voting status of a proposal
     */
    function getVotingStatus(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (VotingStatus)
    {
        return proposals[proposalId].status;
    }

    /**
     * @dev Emergency function to close voting (owner only)
     */
    function emergencyCloseVoting(uint256 proposalId)
        external
        onlyOwner
        proposalExists(proposalId)
    {
        proposals[proposalId].deadline = block.timestamp;
    }
}
