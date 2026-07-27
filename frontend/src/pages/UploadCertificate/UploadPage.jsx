import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  AlertCircle,
  FileType,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import OCRResultModal from "./OCRResultModal";
import VerificationResultModal from "./VerificationResultModal";
import VerifyInfoSection from "./VerifyInfoSection";
import { certificateAPI } from "../../api/axios"; // <-- ADD THIS IMPORT

const CertificateUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifiedCertificate, setVerifiedCertificate] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
    );

    const formattedFiles = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).slice(2, 11),
      status: "pending",
      progress: 0,
    }));

    setFiles((prevFiles) => [...prevFiles, ...formattedFiles]);

    // Auto-process first file
    if (formattedFiles.length > 0) {
      handleFileUpload(formattedFiles[0]);
    }
  };

  const handleFileUpload = async (fileInfo) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileInfo.id ? { ...f, status: "processing" } : f,
      ),
    );

    try {
      console.log("🚀 Starting upload for:", fileInfo.file.name);
      console.log("📄 File type:", fileInfo.file.type);
      console.log("📄 File size:", fileInfo.file.size);

      // Check user role from localStorage
      const userData = localStorage.getItem("user");
      let userRole = "user";
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          userRole = parsed.role || "user";
        } catch (e) {}
      }

      console.log("👤 User role:", userRole);

      let response;

      // If University Admin, upload and store on blockchain
      if (userRole === "university" || userRole === "admin") {
        console.log(
          "🏛️ University Admin - Uploading and storing on blockchain",
        );
        response = await certificateAPI.uploadAndStore(
          fileInfo.file,
          (percent) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileInfo.id]: percent,
            }));
          },
        );
      } else {
        // Regular user - OCR only for verification
        console.log("👤 Regular user - OCR only for verification");
        response = await certificateAPI.uploadForOCR(
          fileInfo.file,
          (percent) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileInfo.id]: percent,
            }));
          },
        );
      }

      console.log("✅ Upload response:", response.data);

      if (response.data.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileInfo.id ?
              { ...f, status: "completed", progress: 100 }
            : f,
          ),
        );

        setCurrentFile(fileInfo);
        setOcrResult(response.data.data);
        setShowOCRModal(true);
      }
    } catch (error) {
      console.error("❌ Upload error details:", error);
      console.error("Error config:", error.config);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);

      let errorMessage = "Upload failed";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.statusText ||
          "Server error";
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check if backend is running.";
      } else {
        errorMessage = error.message;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileInfo.id ?
            {
              ...f,
              status: "error",
              error: errorMessage,
            }
          : f,
        ),
      );
    }
  };

  const handleVerifyWithOCR = async (editedData) => {
    setIsProcessing(true);
    setShowOCRModal(false);

    try {
      console.log("Verifying with OCR data:", editedData);

      const response = await certificateAPI.verifyWithOCR(
        editedData,
        ocrResult,
        {
          name: currentFile?.file?.name,
          type: currentFile?.file?.type,
          size: currentFile?.file?.size,
        },
      );

      console.log("Verification response:", response.data);

      if (response.data.success) {
        setVerificationResult({
          success: true,
          isValid: response.data.isValid,
          message: response.data.message,
          method: response.data.method,
        });
        setVerifiedCertificate(response.data.certificate);
        setShowVerificationModal(true);
      } else {
        setVerificationResult({
          success: false,
          isValid: false,
          message: response.data.message || "Verification failed",
        });
        setShowVerificationModal(true);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        success: false,
        isValid: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Verification failed",
      });
      setShowVerificationModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((fileInfo) => fileInfo.id !== id));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setOcrResult(null);
    setCurrentFile(null);
    setVerificationResult(null);
    setVerifiedCertificate(null);
    setUploadProgress({});
  };

  const getFileStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-5 text-emerald-500" />;
      case "processing":
        return <Loader2 className="size-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="size-5 text-red-500" />;
      default:
        return (
          <div className="size-5 rounded-full border-2 border-slate-300" />
        );
    }
  };

  return (
    <section>
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-color-primary px-4 py-2 rounded-full text-sm font-medium mb-6 tracking-widest"
          >
            <ShieldCheck className="size-4" />
            Blockchain Verification
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[3rem] font-bold mb-4 tracking-tight"
          >
            Verify Your <span className="text-color-primary">Certificates</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Upload your certificate to verify its authenticity on the
            blockchain. Our AI will extract and verify the data automatically.
          </motion.p>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`relative group h-80 rounded-3xl z-0 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 bg-white overflow-hidden cursor-pointer ${
            dragActive ?
              "border-slate-900 bg-slate-50 ring-4 ring-slate-100"
            : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
          />

          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-900 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-900 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={dragActive ? { scale: 1.2 } : { scale: 1 }}
              className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-colors ${
                dragActive ?
                  "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
              }`}
            >
              <Upload className="size-10" />
            </motion.div>

            <h3 className="text-xl font-bold text-[#1e293b] mb-2">
              Click or drag files here
            </h3>

            <p className="text-slate-500 text-sm mb-6 text-center">
              PDF, JPG, or PNG (Max. 10MB per file)
            </p>

            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <FileType className="size-3" />
                PDF Supported
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <FileType className="size-3" />
                Images Supported
              </div>
            </div>
          </div>
        </motion.div>

        {/* Uploaded Files List */}
        <div className="mt-8 space-y-3">
          <AnimatePresence mode="popLayout">
            {files.map((fileInfo) => (
              <motion.div
                key={fileInfo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    {fileInfo.file.type.includes("pdf") ?
                      <FileText className="size-5" />
                    : <FileType className="size-5" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                      {fileInfo.file.name}
                    </h4>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      {(fileInfo.file.size / (1024 * 1024)).toFixed(2)} MB
                      {fileInfo.status === "processing" && (
                        <span className="text-blue-500">
                          • {uploadProgress[fileInfo.id] || 0}%
                        </span>
                      )}
                      {fileInfo.status === "completed" && (
                        <span className="text-emerald-500">• Verified</span>
                      )}
                      {fileInfo.status === "error" && (
                        <span className="text-red-500">• {fileInfo.error}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getFileStatusIcon(fileInfo.status)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileInfo.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Clear All Button */}
        {files.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearAllFiles}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        <VerifyInfoSection />
      </div>

      {/* Modals */}
      <OCRResultModal
        isOpen={showOCRModal}
        onClose={() => {
          setShowOCRModal(false);
          setOcrResult(null);
        }}
        ocrData={ocrResult}
        file={currentFile?.file}
        onVerify={handleVerifyWithOCR}
        isLoading={isProcessing}
      />

      <VerificationResultModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setVerificationResult(null);
        }}
        result={verificationResult}
        certificate={verifiedCertificate}
      />
    </section>
  );
};;;

export default CertificateUpload;
