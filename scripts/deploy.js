import fs from "fs";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying ProofOfWorkRegistry to Moca Devnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("⚠️  WARNING: Account has 0 balance!");
    console.log("🔗 Get testnet tokens from: https://devnet-scan.mocachain.tech");
    return;
  }

  // Deploy the contract
  console.log("\n📦 Deploying ProofOfWorkRegistry contract...");
  const ProofOfWorkRegistry = await hre.ethers.getContractFactory("ProofOfWorkRegistry");
  const registry = await ProofOfWorkRegistry.deploy();

  await registry.waitForDeployment();
  const contractAddress = await registry.getAddress();

  console.log("\n✅ ProofOfWorkRegistry deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 View on explorer: https://devnet-scan.mocachain.tech/address/" + contractAddress);

  console.log("\n📋 Next steps:");
  console.log("1. Add to .env: VITE_REGISTRY_CONTRACT_ADDRESS=" + contractAddress);
  console.log("2. Verify contract (if verifier available)");
  console.log("3. Update frontend to read from contract");
  console.log("4. Update backend to register proofs on-chain");

  // Save deployment info to a file
  const deploymentInfo = {
    network: "mocaDevnet",
    chainId: 5151,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
