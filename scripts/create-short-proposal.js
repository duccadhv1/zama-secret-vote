const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  try {
    // Create a proposal with short deadline (2 seconds from now)
    console.log("📝 Creating proposal with short deadline...");
    const deadline = Math.floor(Date.now() / 1000) + 2; // 2 seconds from now
    console.log(`🕐 Current time: ${new Date().toLocaleString()}`);
    console.log(
      `⏰ Deadline will be: ${new Date(deadline * 1000).toLocaleString()}`
    );

    const createTx = await SecretVote.createProposal(
      "Expired proposal for testing UI",
      deadline
    );
    await createTx.wait();

    const proposalCount = await SecretVote.proposalCounter();
    const proposalId = proposalCount - 1n;

    console.log(`✅ Proposal #${proposalId} created!`);
    console.log(`⏰ Deadline: ${new Date(deadline * 1000).toLocaleString()}`);
    console.log(`⏳ Proposal will expire in 5 seconds...`);
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
