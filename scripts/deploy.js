const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying SecretVote with account:", deployer.address);

  const SecretVote = await hre.ethers.getContractFactory("SecretVote");
  const secretVote = await SecretVote.deploy();
  
  await secretVote.waitForDeployment();
  const contractAddress = await secretVote.getAddress();

  console.log(`SecretVote deployed to: ${contractAddress}`);

  // Verify contract on Etherscan if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  // Save deployment info to environment file
  const fs = require("fs");
  const path = require("path");
  
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  // Update or add contract address
  const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
  const networkLine = `NEXT_PUBLIC_NETWORK=${hre.network.name}\n`;
  
  if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/g, contractAddressLine.trim());
  } else {
    envContent += contractAddressLine;
  }
  
  if (envContent.includes("NEXT_PUBLIC_NETWORK=")) {
    envContent = envContent.replace(/NEXT_PUBLIC_NETWORK=.*/g, networkLine.trim());
  } else {
    envContent += networkLine;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("Contract address saved to .env.local");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
