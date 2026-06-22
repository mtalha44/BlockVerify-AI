import blockchainConfig from "../../config/blockchain.js";

export const storeCertificateHash = async (
  certificateHash,
  studentId,
  issuer,
) => {
  try {
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    const tx = await contract.issueCertificate(
      certificateHash,
      studentId,
      "",
      "",
      "",
    );

    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Blockchain storage error:", error);
    return { success: false, error: error.message };
  }
};

export const verifyCertificate = async (certificateHash) => {
  try {
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    const isValid = await contract.verifyCertificate(certificateHash);
    const details = await contract.getCertificate(certificateHash);

    return {
      success: true,
      isValid,
      details: {
        studentId: details[0],
        studentName: details[1],
        degree: details[2],
        issueDate: new Date(Number(details[3]) * 1000),
        isValid: details[4],
        ipfsHash: details[5],
      },
    };
  } catch (error) {
    return { success: false, error: error.message, isValid: false };
  }
};
