const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  try {
    // Vote on proposal #1 with choice 2 (For)
    console.log("🗳️  Voting on proposal #1 with choice 2 (For)...");
    const voteTx = await SecretVote.vote(1, 2);
    await voteTx.wait();
    console.log("✅ Vote cast successfully!");

    // Vote on proposal #2 with choice 3 (Strongly For)
    console.log("🗳️  Voting on proposal #2 with choice 3 (Strongly For)...");
    const voteTx2 = await SecretVote.vote(2, 3);
    await voteTx2.wait();
    console.log("✅ Vote cast successfully!");

    console.log("🎯 User now has 2 votes! Check the dashboard.");
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
