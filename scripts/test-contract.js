const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from environment
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get the contract
  const SecretVote = await ethers.getContractFactory("SecretVote");
  const secretVote = SecretVote.attach(contractAddress);

  try {
    // Test getProposalCount
    const proposalCount = await secretVote.getProposalCount();
    console.log("Proposal count:", proposalCount.toString());

    // Test creating a proposal
    console.log("Creating a test proposal...");
    const tx = await secretVote.createProposal(
      "Test proposal description",
      24 * 60 * 60
    ); // 24 hours
    await tx.wait();
    console.log("Proposal created!");

    // Check proposal count again
    const newProposalCount = await secretVote.getProposalCount();
    console.log("New proposal count:", newProposalCount.toString());

    // Get the first proposal
    if (newProposalCount > 0) {
      const proposal = await secretVote.getProposal(0);
      console.log("First proposal:", {
        description: proposal[0],
        deadline: proposal[1].toString(),
        status: proposal[2],
        createdAt: proposal[3].toString(),
        creator: proposal[4],
      });

      // Test voting on the proposal
      console.log("Casting a vote...");
      const voteTx = await secretVote.vote(0, 1); // Vote choice 1 on proposal 0
      await voteTx.wait();
      console.log("Vote cast!");

      // Test requesting decryption (this will fail because deadline hasn't passed)
      try {
        console.log("Attempting to request decryption...");
        const decryptTx = await secretVote.requestDecryption(0);
        await decryptTx.wait();
        console.log("Decryption requested!");
      } catch (decryptError) {
        console.log(
          "Expected error (voting still active):",
          decryptError.reason
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
