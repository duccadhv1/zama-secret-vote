const { exec } = require("child_process");

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function createProposal() {
  console.log("1. Creating a proposal...");

  // createProposal(string memory description, uint256 duration)
  // Function signature: createProposal(string,uint256) -> keccak256 -> 0x35facf78

  // Encode the function call data
  // This is complex to do manually, so let's try a different approach

  // Let's use hardhat console to create the proposal
  const hardhatScript = `
    const { ethers } = require("hardhat");
    async function main() {
      const SecretVote = await ethers.getContractFactory("SecretVote");
      const contract = SecretVote.attach("${contractAddress}");
      
      const tx = await contract.createProposal("Test proposal", 3600); // 1 hour
      await tx.wait();
      console.log("Proposal created");
    }
    main().catch(console.error);
  `;

  require("fs").writeFileSync("/tmp/create_proposal.js", hardhatScript);

  return new Promise((resolve, reject) => {
    exec(
      "cd /Users/ducnguyen/working/blockchain/secretvote && node /tmp/create_proposal.js",
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          console.log("✅ Proposal created");
          resolve();
        }
      }
    );
  });
}

async function testGetResults() {
  console.log("\n2. Testing getResults...");

  const proposalId = 0;
  const functionSelector = "6a3777f1";
  const paddedProposalId = proposalId.toString(16).padStart(64, "0");
  const callData = "0x" + functionSelector + paddedProposalId;

  const curlCommand = `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"${contractAddress}","data":"${callData}"},"latest"],"id":1}' http://127.0.0.1:8545`;

  return new Promise((resolve) => {
    exec(curlCommand, (error, stdout, stderr) => {
      const response = JSON.parse(stdout);

      if (response.error) {
        const errorMessage = response.error.message;
        console.log("Error message:", errorMessage);

        if (errorMessage.includes("Results not available.")) {
          console.log("🎉 SUCCESS: Found new error message with period!");
        } else if (errorMessage.includes("Results not available")) {
          console.log("⚠️  OLD: Found old error message without period");
        } else {
          console.log("❓ Different error:", errorMessage);
        }
      } else {
        console.log("❌ Unexpected success - no error occurred");
      }
      resolve();
    });
  });
}

async function main() {
  try {
    await createProposal();
    await testGetResults();
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
