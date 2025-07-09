const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not set in environment");
    return;
  }

  console.log("🔍 Getting all proposals...");

  const SecretVote = await hre.ethers.getContractAt(
    "SecretVote",
    contractAddress
  );

  // Get proposal count
  let proposalCount = 0;
  let foundAll = false;

  // Try to find all proposals by incrementing ID until we hit an error
  while (!foundAll && proposalCount < 100) {
    // Safety limit
    try {
      const proposal = await SecretVote.getProposal(proposalCount);

      const deadline = new Date(Number(proposal[1]) * 1000);
      const createdAt = new Date(Number(proposal[3]) * 1000);
      const isExpired = Date.now() > deadline.getTime();

      console.log(`\n📋 Proposal #${proposalCount}:`);
      console.log(`   Description: "${proposal[0]}"`);
      console.log(
        `   Deadline: ${deadline.toLocaleString()} ${isExpired ? "(EXPIRED)" : "(ACTIVE)"}`
      );
      console.log(
        `   Status: ${proposal[2]} (0=Active, 1=DecryptionRequested, 2=Decrypted)`
      );
      console.log(`   Created: ${createdAt.toLocaleString()}`);
      console.log(`   Creator: ${proposal[4]}`);

      // Try to get results if expired or decrypted
      if (isExpired || proposal[2] == 2) {
        try {
          const results = await SecretVote.getResults(proposalCount);
          const total = results.reduce((sum, count) => sum + Number(count), 0);
          console.log(
            `   Results: [${results.map((r) => r.toString()).join(", ")}] (Total: ${total})`
          );
        } catch (error) {
          console.log(
            `   Results: Not available (${error.reason || "Unknown error"})`
          );
        }
      } else {
        console.log(`   Results: Not available (voting still active)`);
      }

      proposalCount++;
    } catch (error) {
      // Stop when we hit "Proposal does not exist"
      foundAll = true;
    }
  }

  console.log(`\n✅ Found ${proposalCount} proposals total`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
