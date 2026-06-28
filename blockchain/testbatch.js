// blockchain/test-batch.js
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x1F510af5A261af02B6e9A1e65AEAb6BE708ED493"; // Your contract address
  const contract = await hre.ethers.getContractAt(
    "CertificateRegistry",
    contractAddress,
  );

  const merkleRoot =
    "0xeb1917a48b2e4cb865db0d72cb1c361b30ecdee2ccf2ba238b2bfadc70e78ff7";
  const metadata = JSON.stringify({ test: "data", count: 10 });
  const count = 10;

  console.log("Calling storeMerkleBatch with:");
  console.log("  merkleRoot:", merkleRoot);
  console.log("  metadata:", metadata);
  console.log("  count:", count);

  const tx = await contract.storeMerkleBatch(merkleRoot, metadata, count);
  console.log("Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt.blockNumber);
}

main().catch(console.error);
