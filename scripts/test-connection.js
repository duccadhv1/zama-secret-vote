const { ethers } = require("hardhat");

async function testConnection() {
  try {
    console.log("🔍 Testing Hardhat node connection...");

    // Test if we can connect to the local node
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Try to get network info
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", {
      name: network.name,
      chainId: network.chainId.toString(),
    });

    // Try to get block number
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Current block number:", blockNumber);

    // Try to get account list
    const accounts = await provider.listAccounts();
    console.log("✅ Available accounts:", accounts.length);

    if (accounts.length > 0) {
      console.log("First account:", accounts[0]);

      // Check balance of first account
      const balance = await provider.getBalance(accounts[0]);
      console.log("Balance:", ethers.formatEther(balance), "ETH");
    }

    console.log("\n🎉 Hardhat node is running and accessible!");
    console.log("You can now try adding the network to MetaMask.");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n💡 Make sure to start Hardhat node with:");
    console.log("   npx hardhat node");
  }
}

testConnection().catch(console.error);
