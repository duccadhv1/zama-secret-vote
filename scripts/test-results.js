const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from environment
  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  console.log("Testing contract at:", contractAddress);

  // Get the contract
  const SecretVote = await ethers.getContractFactory("SecretVote");
  const contract = SecretVote.attach(contractAddress);

  try {
    // Create a proposal with very short duration (1 second)
    console.log("\n1. Creating a proposal with 1 second duration...");
    const tx = await contract.createProposal("Test proposal for results", 1);
    await tx.wait();
    console.log("✅ Proposal created");

    // Get proposal count
    const count = await contract.getProposalCount();
    console.log("📊 Total proposals:", count.toString());

    const proposalId = count - 1n; // Latest proposal
    console.log("🎯 Testing proposal ID:", proposalId.toString());

    // Wait 2 seconds for the proposal to expire
    console.log("\n2. Waiting 2 seconds for proposal to expire...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try to get results (should work now)
    console.log("\n3. Trying to get results...");
    try {
      const results = await contract.getResults(proposalId);
      console.log("✅ Results retrieved successfully:", results);
    } catch (error) {
      console.log("❌ Error getting results:", error.message);

      // Check if it's the old error message or new one
      if (error.message.includes("Results not available.")) {
        console.log("✅ New error message detected (with period)");
      } else if (error.message.includes("Results not available")) {
        console.log("⚠️  Old error message detected (without period)");
      } else {
        console.log("❓ Unexpected error message");
      }
    }

    // Get proposal details
    console.log("\n4. Getting proposal details...");
    const proposal = await contract.getProposal(proposalId);
    console.log("📋 Proposal details:");
    console.log("   Description:", proposal[0]);
    console.log(
      "   Deadline:",
      new Date(Number(proposal[1]) * 1000).toLocaleString()
    );
    console.log("   Status:", proposal[2]);
    console.log(
      "   Created At:",
      new Date(Number(proposal[3]) * 1000).toLocaleString()
    );
    console.log("   Creator:", proposal[4]);

    // Check current time vs deadline
    const currentTime = Math.floor(Date.now() / 1000);
    const deadline = Number(proposal[1]);
    console.log("\n5. Time check:");
    console.log("   Current time:", currentTime);
    console.log("   Deadline:", deadline);
    console.log("   Has expired:", currentTime >= deadline);
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
