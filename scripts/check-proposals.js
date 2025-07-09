const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  console.log("🔍 Connecting to SecretVote contract...");
  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  try {
    const proposalCount = await SecretVote.proposalCounter();
    console.log(`📊 Total proposals: ${proposalCount}\n`);

    // List all proposals
    for (let i = 0; i < proposalCount; i++) {
      const proposal = await SecretVote.getProposal(i);
      const deadline = new Date(Number(proposal[1]) * 1000);
      const isExpired = Date.now() > deadline.getTime();

      console.log(`📋 Proposal #${i}:`);
      console.log(`   Description: "${proposal[0]}"`);
      console.log(
        `   Deadline: ${deadline.toLocaleString()} ${isExpired ? "(EXPIRED)" : "(ACTIVE)"}`
      );
      console.log(
        `   Status: ${proposal[2]} (0=Active, 1=DecryptionRequested, 2=Decrypted)`
      );
      console.log(`   Creator: ${proposal[4]}`);

      // Test getResults
      if (isExpired || proposal[2] >= 1) {
        try {
          const results = await SecretVote.getResults(i);
          const total = results.reduce((sum, count) => sum + Number(count), 0);
          console.log(
            `   Results: [${results.map((r) => r.toString()).join(", ")}] (Total: ${total})`
          );
        } catch (error) {
          console.log(`   Results: ❌ ${error.reason || error.message}`);
        }
      } else {
        console.log(`   Results: ⏳ Voting still active`);
      }
      console.log("");
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
