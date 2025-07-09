const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  try {
    console.log("📝 Creating proposal with 1 second duration...");

    const createTx = await SecretVote.createProposal("EXPIRED - Test UI", 1);
    await createTx.wait();

    const proposalCount = await SecretVote.proposalCounter();
    const proposalId = proposalCount - 1n;

    console.log(`✅ Proposal #${proposalId} created!`);

    // Fast forward time by mining a block with increased timestamp
    console.log("⏭️  Fast forwarding time...");
    await hre.ethers.provider.send("evm_increaseTime", [5]); // Add 5 seconds
    await hre.ethers.provider.send("evm_mine", []); // Mine a block

    // Get the proposal and check if expired
    const proposal = await SecretVote.getProposal(proposalId);
    const deadline = Number(proposal[1]);

    const currentBlock = await hre.ethers.provider.getBlock("latest");
    const currentTimestamp = currentBlock.timestamp;

    console.log(
      `📋 Proposal deadline: ${deadline} (${new Date(deadline * 1000).toLocaleString()})`
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

    console.log(`\n🎯 Proposal #${proposalId} is ready for testing the UI!`);
    console.log(`   Visit: http://localhost:3000/proposal/${proposalId}`);
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
