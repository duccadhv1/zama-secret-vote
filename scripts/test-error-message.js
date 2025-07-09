const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Define the contract ABI manually (just the functions we need)
  const contractABI = [
    "function createProposal(string memory description, uint256 duration) external returns (uint256)",
    "function getProposalCount() external view returns (uint256)",
    "function getResults(uint256 proposalId) external view returns (uint64[4] memory counts)",
    "function getProposal(uint256 proposalId) external view returns (string memory description, uint256 deadline, uint8 status, uint256 createdAt, address creator)",
  ];

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    console.log("Testing contract with new deployment...");

    // 1. Create a proposal with 2 second duration
    console.log("\n1. Creating proposal with 2 second duration...");
    const tx = await contract.createProposal(
      "Test proposal for error message",
      2
    );
    const receipt = await tx.wait();
    console.log("✅ Proposal created in transaction:", receipt.hash);

    // 2. Get the proposal ID (should be 0 for first proposal)
    const proposalId = 0;
    console.log("📝 Testing proposal ID:", proposalId);

    // 3. Try to get results immediately (should fail with error)
    console.log("\n2. Trying to get results immediately (should fail)...");
    try {
      const results = await contract.getResults(proposalId);
      console.log("❌ Unexpected success - got results:", results);
    } catch (error) {
      console.log("✅ Expected error occurred");
      console.log("Error message:", error.message);

      // Check which error message we got
      if (error.message.includes("Results not available.")) {
        console.log("🎉 SUCCESS: New error message with period detected!");
      } else if (error.message.includes("Results not available")) {
        console.log("⚠️  OLD: Error message without period detected");
      } else {
        console.log("❓ Different error:", error.message);
      }
    }

    // 4. Wait for proposal to expire
    console.log("\n3. Waiting 3 seconds for proposal to expire...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 5. Try to get results after expiration (should work)
    console.log("\n4. Trying to get results after expiration...");
    try {
      const results = await contract.getResults(proposalId);
      console.log(
        "✅ Results after expiration:",
        results.map((r) => r.toString())
      );
    } catch (error) {
      console.log("❌ Still failed after expiration:", error.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
