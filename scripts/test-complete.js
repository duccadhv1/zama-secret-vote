const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from .env.local
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, "../.env.local");

  let contractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // fallback
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(.+)/);
    if (match) {
      contractAddress = match[1].trim();
    }
  }

  console.log("Using contract address:", contractAddress);

  // Get the contract
  const SecretVote = await ethers.getContractFactory("SecretVote");
  const secretVote = SecretVote.attach(contractAddress);

  try {
    // Test getProposalCount
    const proposalCount = await secretVote.getProposalCount();
    console.log("Current proposal count:", proposalCount.toString());

    // Test creating a new proposal
    console.log("Creating a new test proposal...");
    const tx = await secretVote.createProposal(
      "Should we implement feature X?",
      24 * 60 * 60
    ); // 24 hours
    await tx.wait();
    console.log("New proposal created!");

    // Check proposal count again
    const newProposalCount = await secretVote.getProposalCount();
    console.log("New proposal count:", newProposalCount.toString());
    const latestProposalId = newProposalCount - 1n;

    // Get the latest proposal
    const proposal = await secretVote.getProposal(latestProposalId);
    console.log(`Proposal ${latestProposalId}:`, {
      description: proposal[0],
      deadline: new Date(Number(proposal[1]) * 1000).toISOString(),
      status: proposal[2].toString(),
      createdAt: new Date(Number(proposal[3]) * 1000).toISOString(),
      creator: proposal[4],
    });

    // Test voting on the proposal with different accounts
    const [deployer, voter1, voter2] = await ethers.getSigners();

    console.log("Casting votes...");

    // Vote with deployer (choice 0)
    const vote1Tx = await secretVote
      .connedeploct(deployer)
      .vote(latestProposalId, 0);
    await vote1Tx.wait();
    console.log("Deployer voted: choice 0");

    // Vote with voter1 (choice 1)
    const vote2Tx = await secretVote.connect(voter1).vote(latestProposalId, 1);
    await vote2Tx.wait();
    console.log("Voter1 voted: choice 1");

    // Vote with voter2 (choice 2)
    const vote3Tx = await secretVote.connect(voter2).vote(latestProposalId, 2);
    await vote3Tx.wait();
    console.log("Voter2 voted: choice 2");

    // Check voting status
    const hasVoted1 = await secretVote.getHasVoted(
      latestProposalId,
      deployer.address
    );
    const hasVoted2 = await secretVote.getHasVoted(
      latestProposalId,
      voter1.address
    );
    console.log("Deployer has voted:", hasVoted1);
    console.log("Voter1 has voted:", hasVoted2);

    // Get voting status
    const votingStatus = await secretVote.getVotingStatus(latestProposalId);
    console.log("Voting status:", votingStatus.toString());

    console.log("All tests passed! ✅");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
