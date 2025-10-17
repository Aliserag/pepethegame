const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying FlowPepe Leaderboard contract...");
  console.log("Network:", hre.network.name);

  // Get deployer account
  const [deployer] = await hre.viem.getWalletClients();
  console.log("Deploying with account:", deployer.account.address);

  // Deploy contract
  const leaderboard = await hre.viem.deployContract("FlowPepeLeaderboard");
  console.log("✅ Contract deployed to:", leaderboard.address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number(await hre.viem.getPublicClient().getChainId()),
    contractAddress: leaderboard.address,
    deployer: deployer.account.address,
    timestamp: new Date().toISOString(),
    blockNumber: Number(await hre.viem.getPublicClient().getBlockNumber()),
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Deployment info saved to:", deploymentFile);

  // Verify contract on Base Sepolia or Base (if not local)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    // Wait for a few blocks before verifying
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("🔍 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: leaderboard.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("You can manually verify later using:");
        console.log(
          `npx hardhat verify --network ${hre.network.name} ${leaderboard.address}`
        );
      }
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("Contract address:", leaderboard.address);
  console.log("\nAdd this to your .env file:");
  console.log(
    `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=${leaderboard.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
