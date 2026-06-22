const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CertificateRegistry contract...");

  const CertificateRegistry = await hre.ethers.getContractFactory(
    "CertificateRegistry",
  );
  const certificateRegistry = await CertificateRegistry.deploy();

  await certificateRegistry.waitForDeployment();

  const contractAddress = await certificateRegistry.getAddress();

  console.log(`✅ CertificateRegistry deployed to: ${contractAddress}`);
  console.log(
    `🔗 Deployer address: ${(await hre.ethers.getSigners())[0].address}`,
  );

  // Save contract address to .env
  const fs = require("fs");
  const envPath = ".env";
  let envContent = fs.readFileSync(envPath, "utf8");

  if (envContent.includes("CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`,
    );
  } else {
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Contract address saved to .env`);

  // Verify contract on Etherscan (optional)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("🔍 Waiting for block confirmations...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on Etherscan");
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
