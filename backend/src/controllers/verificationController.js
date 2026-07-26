import Certificate from "../models/Certificate.js";
import blockchainConfig from "../config/blockchain.js";
import verificationService from "../services/verification/verificationService.js";
import sha256Service from "../services/hash/sha256Service.js";

/**
 * Verify certificate with OCR data
 * Handles both single and batch (Merkle tree) verification
 */
export const verifyWithOCR = async (req, res) => {
  try {
    const { ocrData, originalData, file } = req.body;
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!ocrData) {
      return res.status(400).json({
        success: false,
        message: "OCR data is required",
      });
    }

    console.log("🔍 Verifying certificate with OCR data...");

    // Generate hash from OCR data - ONLY 7 fields
    const studentData = {
      studentName: ocrData.student_name,
      fatherName: ocrData.father_name || "",
      registrationNumber: ocrData.registration_number,
      rollNumber: ocrData.roll_number || "",
      degree: ocrData.degree,
      session: ocrData.session || "",
      cgpa: ocrData.cgpa || "",
      // NO university_name here
    };

    const generatedHash = sha256Service.generate(studentData);
    console.log(`🔑 Generated hash: ${generatedHash}`);

    // Verify hash against blockchain
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    // Check both single certificate and Merkle tree
    let isValid = false;
    let certificate = null;
    let verificationMethod = "unknown";

    // Direct certificate verification
    try {
      const result = await contract.verifyCertificate(generatedHash);
      if (result.exists && !result.isRevoked) {
        isValid = true;
        verificationMethod = "single";
        console.log("✅ Certificate verified directly on blockchain");
      }
    } catch (directError) {
      console.log("ℹ️ Not a single certificate, checking Merkle tree...");
    }

    // Second try: Check database for Merkle tree certificates
    if (!isValid) {
      const dbCertificate = await Certificate.findOne({
        certificateHash: generatedHash,
      });

      if (dbCertificate) {
        certificate = dbCertificate;

        // Check if it's a batch certificate with Merkle proof
        if (dbCertificate.isBatchCertificate && dbCertificate.merkleRoot) {
          try {
            const merkleValid = await contract.verifyMerkleProof(
              generatedHash,
              dbCertificate.merkleProof,
              dbCertificate.merkleRoot,
            );

            if (merkleValid) {
              const batchInfo = await contract.verifyMerkleBatch(
                dbCertificate.merkleRoot,
              );

              if (batchInfo.exists && batchInfo.isValid) {
                isValid = true;
                verificationMethod = "merkle";
                console.log("✅ Certificate verified via Merkle proof");
              }
            }
          } catch (merkleError) {
            console.error("Merkle verification error:", merkleError.message);
          }
        } else if (dbCertificate.status === "verified") {
          isValid = true;
          verificationMethod = "database";
          console.log("✅ Certificate verified from database");
        }
      }
    }

    // Prepare response
    if (isValid) {
      if (!certificate) {
        certificate = await Certificate.findOne({
          certificateHash: generatedHash,
        });
      }

      if (!certificate) {
        certificate = {
          certificateHash: generatedHash,
          studentName: studentData.studentName,
          registrationNumber: studentData.registrationNumber,
          degree: studentData.degree,
          session: studentData.session,
          cgpa: studentData.cgpa,
          transactionHash: "blockchain",
          blockNumber: "blockchain",
          isBatchCertificate: false,
        };
      }

      return res.status(200).json({
        success: true,
        isValid: true,
        message: "Certificate verified successfully",
        method: verificationMethod,
        certificate: {
          certificateHash: certificate.certificateHash,
          studentName: certificate.studentName || studentData.studentName,
          registrationNumber: certificate.registrationNumber || studentData.registrationNumber,
          degree: certificate.degree || studentData.degree,
          session: certificate.session || studentData.session,
          cgpa: certificate.cgpa || studentData.cgpa,
          transactionHash: certificate.transactionHash,
          blockNumber: certificate.blockNumber,
          isBatchCertificate: certificate.isBatchCertificate || false,
          merkleRoot: certificate.merkleRoot || null,
          status: certificate.status || "verified",
        },
        ocrData: originalData,
        correctedData: studentData,
      });
    } else {
      return res.status(200).json({
        success: true,
        isValid: false,
        message: "Certificate could not be verified. The hash does not match any record on the blockchain.",
        certificate: null,
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify certificate",
    });
  }
};

/**
 * Verify certificate by hash (existing function)
 */
export const verifyCertificateByHash = async (req, res) => {
  try {
    const { hash } = req.params || req.body;

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: "Certificate hash is required",
      });
    }

    console.log(`🔍 Verifying certificate: ${hash}`);

    const result = await verificationService.verifyCertificate(hash);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Batch verify multiple certificates
 */
export const batchVerifyCertificates = async (req, res) => {
  try {
    const { certificates } = req.body;

    if (
      !certificates ||
      !Array.isArray(certificates) ||
      certificates.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Array of certificates required",
      });
    }

    console.log(`🔍 Batch verifying ${certificates.length} certificates...`);

    const results = [];
    for (const cert of certificates) {
      try {
        const result = await verificationService.verifyCertificate(
          cert.hash || cert,
        );
        results.push({
          hash: cert.hash || cert,
          ...result,
        });
      } catch (error) {
        results.push({
          hash: cert.hash || cert,
          valid: false,
          error: error.message,
        });
      }
    }

    const verified = results.filter((r) => r.valid).length;

    res.status(200).json({
      success: true,
      total: results.length,
      verified,
      results,
    });
  } catch (error) {
    console.error("Batch verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
