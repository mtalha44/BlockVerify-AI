// backend/src/config/blockchain.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlockchainConfig {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
    this.walletAddress = null;
    this.artifact = null; // Cache artifact
  }

  async initialize() {
    try {
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("SERVER_WALLET_PRIVATE_KEY not found in .env");
      }

      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.walletAddress = await this.signer.getAddress();

      this.contractAddress = process.env.CONTRACT_ADDRESS;
      if (!this.contractAddress) {
        throw new Error("CONTRACT_ADDRESS not found in .env");
      }

      // Load ABI - Use fs.readFileSync instead of require
      const artifactPath = path.join(
        __dirname,
        "../../../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json",
      );

      console.log(`📄 Loading artifact from: ${artifactPath}`);

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Contract artifact not found at ${artifactPath}`);
      }

      // Read and parse the artifact file
      const artifactContent = fs.readFileSync(artifactPath, "utf8");
      const artifact = JSON.parse(artifactContent);

      console.log(`✅ Artifact loaded, ABI has ${artifact.abi.length} entries`);

      // Log the storeMerkleBatch method signature for debugging
      const method = artifact.abi.find(
        (item) => item.name === "storeMerkleBatch" && item.type === "function",
      );
      if (method) {
        console.log(`🔍 storeMerkleBatch signature found`);
      }

      this.contract = new ethers.Contract(
        this.contractAddress,
        artifact.abi,
        this.signer,
      );

      console.log(`✅ Blockchain connected`);
      console.log(`👛 Wallet: ${this.walletAddress}`);
      console.log(`📝 Contract: ${this.contractAddress}`);

      const balance = await this.provider.getBalance(this.walletAddress);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

      return true;
    } catch (error) {
      console.error("❌ Blockchain initialization failed:", error);
      throw error;
    }
  }

  getContract() {
    return this.contract;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getWalletAddress() {
    return this.walletAddress;
  }

  // Helper to verify contract methods exist
  async verifyContractMethods() {
    if (!this.contract) return;

    const methods = [
      "storeCertificate",
      "storeMerkleBatch",
      "revokeCertificate",
      "revokeMerkleBatch",
      "verifyCertificate",
      "verifyMerkleProof",
      "verifyMerkleBatch",
      "getBatchInfo",
      "getIssuerStats",
      "getCertificateCount",
    ];

    console.log("🔍 Checking contract methods:");
    for (const method of methods) {
      try {
        const exists = this.contract[method] !== undefined;
        console.log(`   ${method}: ${exists ? "✅" : "❌"}`);
      } catch (e) {
        console.log(`   ${method}: ❌ (error)`);
      }
    }
  }
}

export default new BlockchainConfig();
