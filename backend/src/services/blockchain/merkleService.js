// backend/src/services/blockchain/merkleService.js
import { ethers } from "ethers";

class MerkleTree {
  constructor(leaves = []) {
    this.leaves = leaves;
    this.tree = [];
    this.root = null;

    if (leaves.length > 0) {
      this.buildTree();
    }
  }

  buildTree() {
    if (this.leaves.length === 0) return;

    let currentLevel = this.leaves.map((leaf) =>
      leaf.startsWith("0x") ? leaf.toLowerCase() : "0x" + leaf.toLowerCase()
    );

    this.tree = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

        const hash = ethers.solidityPackedKeccak256(
          ["bytes32", "bytes32"],
          [left, right].sort() // Sort for deterministic ordering
        );

        nextLevel.push(hash);
      }

      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    this.root = currentLevel[0];
    return this.root;
  }

  getProof(index) {
    if (index >= this.leaves.length) return [];

    const proof = [];
    let currentIndex = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const isRightNode = currentIndex % 2;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < this.tree[level].length) {
        proof.push(this.tree[level][siblingIndex]);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  verifyProof(leaf, proof, root) {
    let computedHash = leaf.startsWith("0x") ? leaf : "0x" + leaf;

    for (const sibling of proof) {
      const [left, right] = [computedHash, sibling].sort();
      computedHash = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [left, right]
      );
    }

    return computedHash.toLowerCase() === root.toLowerCase();
  }

  getLeaves() {
    return this.leaves;
  }

  getRoot() {
    return this.root;
  }

  getLeafCount() {
    return this.leaves.length;
  }

  getDepth() {
    return this.tree.length - 1;
  }
}

// Build tree from certificate hashes
export const createMerkleTreeFromStudents = (students) => {
  const leaves = students.map((student) =>
    student.hash.startsWith("0x")
      ? student.hash.toLowerCase()
      : "0x" + student.hash.toLowerCase()
  );

  return new MerkleTree(leaves);
};

export default MerkleTree;