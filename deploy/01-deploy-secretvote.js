const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying SecretVote with account:", deployer);

  const secretVote = await deploy("SecretVote", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.chainId === 31337 ? 1 : 5,
  });

  console.log("SecretVote deployed to:", secretVote.address);

  // Save the contract address to .env.local for frontend
  const fs = require("fs");
  const path = require("path");

  const envPath = path.join(__dirname, "..", ".env.local");
  let envContent = "";

  try {
    envContent = fs.readFileSync(envPath, "utf8");
  } catch (error) {
    // File doesn't exist, create new content
  }

  // Update or add the contract address
  const addressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${secretVote.address}`;
  const lines = envContent.split("\n");
  const addressLineIndex = lines.findIndex((line) =>
    line.startsWith("NEXT_PUBLIC_CONTRACT_ADDRESS=")
  );

  if (addressLineIndex !== -1) {
    lines[addressLineIndex] = addressLine;
  } else {
    lines.push(addressLine);
  }

  fs.writeFileSync(
    envPath,
    lines.filter((line) => line.trim()).join("\n") + "\n"
  );
  console.log("Contract address saved to .env.local");
};

module.exports.tags = ["SecretVote"];
