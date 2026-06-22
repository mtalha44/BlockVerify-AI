// backend/src/services/blockchain/merkleService.js
import { ethers } from "ethers";
import crypto from "crypto";

/**
 * Merkle Tree Service for batch certificate verification
 * Creates Merkle tree from certificate hashes for efficient batch verification
 */
class MerkleService {
  constructor() {
    this.leaves = [];
    this.tree = [];
    this.root = null;
  }

  /**
   * Build Merkle tree from certificate data
   * @param {Array} certificates - Array of certificate objects
   * @returns {Object} Merkle tree with root and proofs
   */
  buildTree(certificates) {
    // Step 1: Create leaves by hashing each certificate
    this.leaves = certificates.map((cert, index) => {
      const data = JSON.stringify({
        index,
        studentId: cert.studentId,
        studentName: cert.studentName,
        degree: cert.degree,
        hash: cert.certificateHash,
        timestamp: cert.issueDate || Date.now(),
      });
      return this.hashData(data);
    });

    // Step 2: If only one leaf, it's also the root
    if (this.leaves.length === 1) {
      this.tree = [this.leaves];
      this.root = this.leaves[0];
      return this.getTreeData();
    }

    // Step 3: Build tree bottom-up
    this.tree = [this.leaves];
    let currentLevel = this.leaves;

    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const combined = left + right;
        nextLevel.push(this.hashData(combined));
      }
      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    this.root = currentLevel[0];
    return this.getTreeData();
  }

  /**
   * Generate Merkle proof for a specific certificate
   * @param {string} certificateHash - Hash of the certificate
   * @returns {Object} Proof containing path and sibling hashes
   */
  generateProof(certificateHash) {
    if (this.leaves.length === 0) {
      throw new Error("Tree is empty. Build tree first.");
    }

    // Find leaf index
    const leafIndex = this.leaves.findIndex(
      (leaf) => leaf === this.hashData(certificateHash),
    );

    if (leafIndex === -1) {
      // Try with full certificate data
      const leafHash = this.hashData(certificateHash);
      const index = this.leaves.findIndex((leaf) => leaf === leafHash);
      if (index === -1) {
        throw new Error("Certificate not found in tree");
      }
      return this.generateProofByIndex(index);
    }

    return this.generateProofByIndex(leafIndex);
  }

  /**
   * Generate proof by index
   * @param {number} index - Index of the leaf
   * @returns {Object} Proof object
   */
  generateProofByIndex(index) {
    if (this.leaves.length === 0) {
      throw new Error("Tree is empty. Build tree first.");
    }

    const proof = [];
    let currentIndex = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      const siblingHash = this.tree[level][siblingIndex] || null;

      if (siblingHash) {
        proof.push({
          position: isRightNode ? "left" : "right",
          hash: siblingHash,
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      leafIndex: index,
      leafHash: this.leaves[index],
      proof,
      root: this.root,
      treeDepth: this.tree.length - 1,
    };
  }

  /**
   * Verify a certificate using Merkle proof
   * @param {Object} proof - Proof object from generateProof
   * @param {string} certificateHash - Hash to verify
   * @returns {boolean} True if valid
   */
  verifyProof(proof, certificateHash) {
    if (!proof || !proof.proof || !proof.root) {
      return false;
    }

    let computedHash = this.hashData(certificateHash);

    for (const node of proof.proof) {
      const combined =
        node.position === "left"
          ? node.hash + computedHash
          : computedHash + node.hash;
      computedHash = this.hashData(combined);
    }

    return computedHash === proof.root;
  }

  /**
   * Hash data using SHA-256
   * @param {string} data - Data to hash
   * @returns {string} Hex hash
   */
  hashData(data) {
    if (typeof data !== "string") {
      data = JSON.stringify(data);
    }
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Get Ethereum compatible hash (keccak256)
   * @param {string} data - Data to hash
   * @returns {string} Keccak256 hash
   */
  hashDataEth(data) {
    if (typeof data !== "string") {
      data = JSON.stringify(data);
    }
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  /**
   * Get tree data
   * @returns {Object} Tree data
   */
  getTreeData() {
    return {
      root: this.root,
      leaves: this.leaves,
      tree: this.tree,
      leafCount: this.leaves.length,
      treeDepth: this.tree.length - 1,
    };
  }

  /**
   * Reset tree
   */
  reset() {
    this.leaves = [];
    this.tree = [];
    this.root = null;
  }

  /**
   * Create Merkle root from certificate hashes for batch storage
   * @param {Array} certificateHashes - Array of certificate hashes
   * @returns {string} Merkle root hash
   */
  createBatchRoot(certificateHashes) {
    if (certificateHashes.length === 0) {
      throw new Error("No certificate hashes provided");
    }

    // Hash each certificate hash
    const leaves = certificateHashes.map((hash) =>
      crypto.createHash("sha256").update(hash).digest("hex"),
    );

    // Build tree
    let currentLevel = leaves;
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const combined = left + right;
        nextLevel.push(
          crypto.createHash("sha256").update(combined).digest("hex"),
        );
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }
}

export default new MerkleService();
