const { exec } = require("child_process");

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const proposalId = 0;

// getProposal function selector: 0x013cf08b
const functionSelector = "013cf08b";
const paddedProposalId = proposalId.toString(16).padStart(64, "0");
const callData = "0x" + functionSelector + paddedProposalId;

console.log("Getting proposal details...");
console.log("Call data:", callData);

const curlCommand = `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"${contractAddress}","data":"${callData}"},"latest"],"id":1}' http://127.0.0.1:8545`;

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error);
    return;
  }

  const response = JSON.parse(stdout);
  console.log("Response:", JSON.stringify(response, null, 2));

  if (response.result && response.result !== "0x") {
    // Decode the result manually is complex, but we can see it exists
    console.log("✅ Proposal exists and has data");

    // Also check current timestamp vs deadline using block info
    const blockCommand = `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false],"id":1}' http://127.0.0.1:8545`;

    exec(blockCommand, (error, stdout, stderr) => {
      if (!error) {
        const blockResponse = JSON.parse(stdout);
        const currentTime = parseInt(blockResponse.result.timestamp, 16);
        console.log(
          "Current block timestamp:",
          currentTime,
          "(" + new Date(currentTime * 1000).toLocaleString() + ")"
        );
      }
    });
  }
});
