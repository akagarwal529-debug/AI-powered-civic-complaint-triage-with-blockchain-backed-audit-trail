const hre = require("hardhat");

async function main() {
  console.log("Deploying CivicTriage...");

  const CivicTriage = await hre.ethers.getContractFactory("CivicTriage");
  const civic = await CivicTriage.deploy();
  await civic.waitForDeployment();

  const address = await civic.getAddress();
  console.log("✅ CivicTriage deployed to:", address);

  // Save address to a file so backend can read it
  const fs = require("fs");
  const path = require("path");
  const outPath = path.join(__dirname, "..", "deployed-address.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ address, chainId: 31337 }, null, 2)
  );
  console.log("📝 Address saved to deployed-address.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});