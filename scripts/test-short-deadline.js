const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  console.log("Creating proposal with very short deadline...");

  const SecretVote = await ethers.getContractFactory("SecretVote");
  const contract = SecretVote.attach(contractAddress);

  // Create proposal with 1 second deadline
  const tx = await contract.createProposal(
    "Test proposal with short deadline",
    1
  );
  const receipt = await tx.wait();

  console.log("✅ Proposal created successfully!");
  console.log("Transaction hash:", receipt.hash);

  // Get the proposal ID (should be 1 since we already created proposal 0)
  const count = await contract.getProposalCount();
  const newProposalId = count - 1n;
  console.log("📝 New proposal ID:", newProposalId.toString());

  // Test immediately (should fail)
  console.log("\n🔍 Testing getResults immediately (should fail)...");
  try {
    const results = await contract.getResults(newProposalId);
    console.log("❌ Unexpected success:", results);
  } catch (error) {
    console.log("✅ Expected error:");
    console.log("Error reason:", error.reason);
    console.log("Error message:", error.message);

    if (error.reason === "Results not available.") {
      console.log("🎉 SUCCESS: Found new error message with period!");
    } else if (error.reason === "Results not available") {
      console.log("⚠️  OLD: Found old error message without period");
    } else {
      console.log("❓ Different error reason:", error.reason);
    }
  }

  // Wait 2 seconds for deadline to pass
  console.log("\n⏳ Waiting 2 seconds for deadline to pass...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test after deadline (should succeed)
  console.log("\n🔍 Testing getResults after deadline (should succeed)...");
  try {
    const results = await contract.getResults(newProposalId);
    console.log(
      "✅ Results after deadline:",
      results.map((r) => r.toString())
    );
  } catch (error) {
    console.log("❌ Still failed after deadline:");
    console.log("Error reason:", error.reason);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
