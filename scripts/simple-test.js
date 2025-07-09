const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  // Get proposal count
  try {
    const proposalCount = await SecretVote.proposalCounter();
    console.log(`📊 Total proposals: ${proposalCount}`);

    // Create a new proposal
    console.log("📝 Creating new proposal...");
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const createTx = await SecretVote.createProposal(
      "Should we implement feature X?",
      deadline
    );
    await createTx.wait();
    console.log("✅ Proposal created!");

    // Check new count
    const newCount = await SecretVote.proposalCounter();
    console.log(`📊 New proposal count: ${newCount}`);

    // Get the proposal we just created
    const proposalId = newCount - 1n;
    const proposal = await SecretVote.getProposal(proposalId);
    console.log(`📋 Created Proposal #${proposalId}:`);
    console.log(`   Description: "${proposal[0]}"`);
    console.log(
      `   Deadline: ${new Date(Number(proposal[1]) * 1000).toLocaleString()}`
    );
    console.log(`   Status: ${proposal[2]}`);
    console.log(`   Creator: ${proposal[4]}`);
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
