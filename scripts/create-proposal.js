const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  console.log("Creating proposal...");

  const SecretVote = await ethers.getContractFactory("SecretVote");
  const contract = SecretVote.attach(contractAddress);

  const tx = await contract.createProposal(
    "Test proposal for error message",
    3600
  ); // 1 hour
  const receipt = await tx.wait();

  console.log("✅ Proposal created successfully!");
  console.log("Transaction hash:", receipt.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
