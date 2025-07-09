// Test the error message by calling getResults on a non-existent proposal
// This should trigger the "Results not available." error

const proposalId = 0; // Test with proposal ID 0
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Encode getResults(uint256) function call
// Function signature: getResults(uint256) -> keccak256("getResults(uint256)") = 0x6a3777f1
// Argument: proposalId (0) -> padded to 32 bytes
const functionSelector = "6a3777f1";
const paddedProposalId = proposalId.toString(16).padStart(64, "0");
const callData = "0x" + functionSelector + paddedProposalId;

console.log("Testing error message...");
console.log("Contract:", contractAddress);
console.log("Call data:", callData);
console.log("Proposal ID:", proposalId);

// Use curl to make the call
const curlCommand = `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"${contractAddress}","data":"${callData}"},"latest"],"id":1}' http://127.0.0.1:8545`;

console.log("\nRunning call...");
console.log("Command:", curlCommand);

const { exec } = require("child_process");

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error);
    return;
  }

  const response = JSON.parse(stdout);
  console.log("\nResponse:", JSON.stringify(response, null, 2));

  if (response.error) {
    const errorMessage = response.error.message;
    console.log("\nError message:", errorMessage);

    if (errorMessage.includes("Results not available.")) {
      console.log("🎉 SUCCESS: Found new error message with period!");
    } else if (errorMessage.includes("Results not available")) {
      console.log("⚠️  OLD: Found old error message without period");
    } else {
      console.log("❓ Different error message");
    }
  } else {
    console.log("❌ Unexpected success - no error occurred");
  }
});
