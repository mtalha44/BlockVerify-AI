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
  }

  async initialize() {
    try {
      // Get RPC URL (use localhost or Sepolia)
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Setup signer
      const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("SERVER_WALLET_PRIVATE_KEY not found in .env");
      }

      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.walletAddress = await this.signer.getAddress();

      // Get contract address
      this.contractAddress = process.env.CONTRACT_ADDRESS;
      if (!this.contractAddress) {
        throw new Error("CONTRACT_ADDRESS not found in .env");
      }

      // Load ABI
      const artifactPath = path.join(
        __dirname,
        "../../../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json",
      );

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Contract artifact not found at ${artifactPath}`);
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      this.contract = new ethers.Contract(
        this.contractAddress,
        artifact.abi,
        this.signer,
      );

      console.log(`✅ Blockchain connected`);
      console.log(`👛 Wallet: ${this.walletAddress}`);
      console.log(`📝 Contract: ${this.contractAddress}`);

      // Check balance
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
}

export default new BlockchainConfig();
