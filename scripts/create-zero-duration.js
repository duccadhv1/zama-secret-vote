const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  try {
    console.log("📝 Creating proposal that expires immediately...");

    // Create with 0 duration to get immediate expiry
    const createTx = await SecretVote.createProposal(
      "EXPIRED NOW - Test UI",
      0
    );
    const receipt = await createTx.wait();

    const proposalCount = await SecretVote.proposalCounter();
    const proposalId = proposalCount - 1n;

    console.log(
      `✅ Proposal #${proposalId} created in block ${receipt.blockNumber}!`
    );

    // Get the proposal immediately
    const proposal = await SecretVote.getProposal(proposalId);
    const deadline = Number(proposal[1]);

    // Get current block timestamp
    const currentBlock = await hre.ethers.provider.getBlock("latest");
    const currentTimestamp = currentBlock.timestamp;

    console.log(
      `📋 Contract deadline: ${deadline} (${new Date(deadline * 1000).toLocaleString()})`
    );
    console.log(
      `🕐 Current block time: ${currentTimestamp} (${new Date(currentTimestamp * 1000).toLocaleString()})`
    );
    console.log(`❓ Is expired: ${currentTimestamp >= deadline}`);

    // Test getResults (should fail with "Results not available")
    try {
      const results = await SecretVote.getResults(proposalId);
      console.log(
        `⚠️  Unexpected success - got results:`,
        results.map((r) => r.toString())
      );
    } catch (error) {
      console.log(
        `✅ Expected error: ${error.reason || "Results not available"}`
      );
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
