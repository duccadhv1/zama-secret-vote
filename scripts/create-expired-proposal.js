const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  try {
    // For createProposal, the second parameter is DURATION (in seconds from now), not absolute timestamp
    // To create an expired proposal, we need a very small duration that will expire by the time we test
    const shortDuration = 1; // 1 second duration

    console.log(
      `🕐 Creating proposal with ${shortDuration} second duration...`
    );

    const createTx = await SecretVote.createProposal(
      "EXPIRED - Test Results UI",
      shortDuration
    );
    await createTx.wait();

    const proposalCount = await SecretVote.proposalCounter();
    const proposalId = proposalCount - 1n;

    console.log(`✅ Proposal #${proposalId} created!`);

    // Wait a bit to ensure it expires
    console.log("⏳ Waiting 3 seconds for proposal to expire...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify the proposal
    const proposal = await SecretVote.getProposal(proposalId);
    const deadlineFromContract = Number(proposal[1]);
    const currentTime = Math.floor(Date.now() / 1000);

    console.log(
      `📋 Deadline: ${deadlineFromContract} (${new Date(deadlineFromContract * 1000).toLocaleString()})`
    );
    console.log(
      `🕐 Current:  ${currentTime} (${new Date(currentTime * 1000).toLocaleString()})`
    );
    console.log(`❓ Is expired: ${currentTime > deadlineFromContract}`);

    // Test getResults (should fail with "Results not available")
    try {
      const results = await SecretVote.getResults(proposalId);
      console.log(`⚠️  Unexpected success:`, results);
    } catch (error) {
      console.log(`✅ Expected error: ${error.reason || error.message}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
