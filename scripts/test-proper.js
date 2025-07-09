const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Get contract factory and attach
  const SecretVote = await ethers.getContractFactory("SecretVote");
  const contract = SecretVote.attach(contractAddress);

  try {
    console.log("Testing with Hardhat contract factory...");

    // 1. Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Contract code length:", code.length);

    // 2. Create a proposal with 2 second duration
    console.log("\n1. Creating proposal...");
    const tx = await contract.createProposal("Test proposal", 2);
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    // 3. Check proposal count
    const count = await contract.getProposalCount();
    console.log("📊 Proposal count:", count.toString());

    if (count > 0) {
      const proposalId = count - 1n;
      console.log("📝 Testing proposal ID:", proposalId.toString());

      // 4. Try to get results immediately (should fail)
      console.log("\n2. Trying to get results immediately...");
      try {
        const results = await contract.getResults(proposalId);
        console.log("❌ Unexpected success:", results);
      } catch (error) {
        console.log("✅ Expected error occurred");
        console.log("Full error:", error);

        // Extract the revert reason
        if (error.reason) {
          console.log("Revert reason:", error.reason);
          if (error.reason === "Results not available.") {
            console.log("🎉 SUCCESS: New error message with period!");
          } else if (error.reason === "Results not available") {
            console.log("⚠️  OLD: Error message without period");
          }
        }
      }

      // 5. Wait and try again
      console.log("\n3. Waiting 3 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("\n4. Trying again after deadline...");
      try {
        const results = await contract.getResults(proposalId);
        console.log(
          "✅ Results:",
          results.map((r) => r.toString())
        );
      } catch (error) {
        console.log("❌ Still failed:", error.reason || error.message);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
