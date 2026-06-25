import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  Ban,
  Database,
  Clock,
  Hash,
  Users,
  CheckCircle2,
  Search,
  LogOut,
  X,
  FileText,
  Activity,
  ArrowRight,
  Info,
  ShieldAlert,
  Files,
} from "lucide-react";
import BlockCertLogo from "../components/Header/BlockCertLogo";
import API from "../api/axios";

const UniversityDashboard = () => {
  // --- REAL-TIME DYNAMIC STATES ---
  const [activeTab, setActiveTab] = useState("upload");

  // Stats Counters
  const [totalTxs, setTotalTxs] = useState(1245);
  const [recordsStored, setRecordsStored] = useState(5420);
  const [verifiedStudents, setVerifiedStudents] = useState(2150);

  // Files State
  const [certificateFile, setCertificateFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [revokeFile, setRevokeFile] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);

  // Active Interactive Details Modal state
  const [selectedTx, setSelectedTx] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Simulated Processing States for feedback animations
  const [isProcessingCert, setIsProcessingCert] = useState(false);
  const [certProcessingStep, setCertProcessingStep] = useState("");
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [excelProcessingStep, setExcelProcessingStep] = useState("");
  const [isProcessingRevoke, setIsProcessingRevoke] = useState(false);
  const [revokeProcessingStep, setRevokeProcessingStep] = useState("");
  const [isProcessingBulkDocs, setIsProcessingBulkDocs] = useState(false);
  const [bulkDocsProcessingStep, setBulkDocsProcessingStep] = useState("");
  const [bulkProgress, setBulkProgress] = useState({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
  });

  // Revocation context fields (dropdown selection to make it extremely easy to test)
  const [targetRollToRevoke, setTargetRollToRevoke] = useState("");
  const [revocationReasonInput, setRevocationReasonInput] = useState("");

  // Transaction History Feed
  const [transactions, setTransactions] = useState([]);

  // Helper: Generate a simulated cryptographic transactional hash
  const generateSecuredHash = (studentName) => {
    let hash = "0x";
    const chars = "ABCDEF0123456789";
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // frontend/src/dashboard/UniDashboard.jsx
  // ADD these new functions after the state declarations

  // Fetch real transactions from backend
  const fetchTransactions = async () => {
    try {
      const response = await API.get("/certificates/certificates", {
        params: { limit: 10 },
      });

      if (response.data.success) {
        const formattedTransactions = response.data.certificates.map(
          (cert) => ({
            id: cert._id || cert.certificateHash,
            student: cert.studentName || "Unknown",
            rollNumber: cert.registrationNumber || cert.rollNumber || "N/A",
            hash: cert.certificateHash || "0x...",
            time: new Date(
              cert.createdAt || cert.issueDate,
            ).toLocaleTimeString(),
            type: cert.type || "Upload",
            status: cert.status || "Verified",
            degree: cert.degree || "N/A",
            gpa: cert.cgpa || "N/A",
            gasUsed: "~45,000 Gas",
            blockNumber: cert.blockNumber || 0,
            revocationReason: cert.revocationReason || null,
          }),
        );

        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await API.get("/certificates/dashboard-stats");
      if (response.data.success) {
        setTotalTxs(response.data.totalWriteTransactions || 0);
        setRecordsStored(response.data.recordsStored || 0);
        setVerifiedStudents(response.data.verifiedStudents || 0);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    // Fetch real data when dashboard loads
    fetchTransactions();
    fetchDashboardStats();
  }, []);

  // 1. Handle Certificate OCR Upload Integration
  // frontend/src/dashboard/UniDashboard.jsx (Update the upload function)

  // Find the handleCertificateUpload function and update it:
  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG, and PDF files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setCertificateFile(file);
    setIsProcessingCert(true);
    setCertProcessingStep("Uploading to server...");

    const formData = new FormData();
    formData.append("certificate", file);

    try {
      setCertProcessingStep("Processing with OCR...");

      const response = await API.post("/certificates/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });

      console.log("✅ Upload Response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setCertProcessingStep(
          "✅ Certificate verified and stored on blockchain!",
        );

        // Add to transaction list
        const newTx = {
          id: `tx-${Date.now()}`,
          student: data.studentName || "Unknown",
          rollNumber: data.registrationNumber || "N/A",
          hash: data.certificateHash || "0x...",
          time: new Date().toLocaleTimeString(),
          type: "Upload",
          status: "Verified",
          degree: data.degree || "N/A",
          gpa: data.cgpa || "N/A",
          gasUsed: "~45,000 Gas",
          blockNumber: data.blockNumber || 0,
        };
        setTransactions((prev) => [newTx, ...prev]);

        // Update stats
        setTotalTxs((prev) => prev + 1);
        setRecordsStored((prev) => prev + 1);
        setVerifiedStudents((prev) => prev + 1);

        // Clear file
        setCertificateFile(null);

        setTimeout(() => {
          setIsProcessingCert(false);
          setCertProcessingStep("");
        }, 2000);
      } else {
        setCertProcessingStep(
          "❌ Error: " + (response.data.message || "Upload failed"),
        );
        setTimeout(() => setIsProcessingCert(false), 3000);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      setCertProcessingStep(
        "❌ Error: " + (error.response?.data?.message || error.message),
      );
      setTimeout(() => setIsProcessingCert(false), 3000);
    }
  };

  // 2. Execute Certificate Extraction - Use Real API
  const executeCertificateExtraction = async () => {
    if (!certificateFile) return;

    setIsProcessingCert(true);
    setCertProcessingStep("Sending to OCR service...");

    const formData = new FormData();
    formData.append("certificate", certificateFile);

    try {
      setCertProcessingStep("Processing with OCR...");

      const response = await API.post("/certificates/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });

      if (response.data.success) {
        const data = response.data.data;
        setCertProcessingStep(
          "✅ Certificate verified and stored on blockchain!",
        );

        // Add to transaction list
        const newTx = {
          id: `tx-${Date.now()}`,
          student: data.studentName || "Unknown",
          rollNumber: data.registrationNumber || "N/A",
          hash: data.certificateHash || "0x...",
          time: new Date().toLocaleTimeString(),
          type: "Upload",
          status: "Verified",
          degree: data.degree || "N/A",
          gpa: data.cgpa || "N/A",
          gasUsed: "~45,000 Gas",
          blockNumber: data.blockNumber || 0,
        };
        setTransactions((prev) => [newTx, ...prev]);
        setTotalTxs((prev) => prev + 1);
        setRecordsStored((prev) => prev + 1);
        setVerifiedStudents((prev) => prev + 1);
        setCertificateFile(null);

        setTimeout(() => {
          setIsProcessingCert(false);
          setCertProcessingStep("");
        }, 2000);
      } else {
        setCertProcessingStep("❌ Error: " + response.data.message);
        setTimeout(() => setIsProcessingCert(false), 3000);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setCertProcessingStep(
        "❌ Error: " + (error.response?.data?.message || error.message),
      );
      setTimeout(() => setIsProcessingCert(false), 3000);
    }
  };

  // 2. Handle Excel Upload Integration
  const handleExcelUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  const executeBulkImport = () => {
    if (!excelFile) return;

    setIsProcessingExcel(true);
    setExcelProcessingStep("Reading worksheet records...");

    setTimeout(() => {
      setExcelProcessingStep(
        "Parsed 3 student entries: Bilal, Nimra, Hammad...",
      );
      setTimeout(() => {
        setExcelProcessingStep(
          "Generating Merkle Tree leaves & gas parameters...",
        );
        setTimeout(() => {
          setExcelProcessingStep("Pushing batch to smart contract...");
          setTimeout(() => {
            const bulkRecords = [
              {
                id: `bulk-1-${Date.now()}`,
                student: "Bilal Anwar",
                rollNumber: "2023-SE-094",
                hash: generateSecuredHash("Bilal Anwar"),
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                type: "Bulk Import",
                status: "Verified",
                degree: "BS Software Engineering",
                gpa: "3.64",
                gasUsed: "74,210 Gas (Batch)",
                blockNumber: 15483120,
              },
              {
                id: `bulk-2-${Date.now()}`,
                student: "Nimra Jameel",
                rollNumber: "2023-CS-318",
                hash: generateSecuredHash("Nimra Jameel"),
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                type: "Bulk Import",
                status: "Verified",
                degree: "BS Computer Science",
                gpa: "3.78",
                gasUsed: "74,210 Gas (Batch)",
                blockNumber: 15483121,
              },
              {
                id: `bulk-3-${Date.now()}`,
                student: "Hammad Safdar",
                rollNumber: "2023-EE-115",
                hash: generateSecuredHash("Hammad Safdar"),
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                type: "Bulk Import",
                status: "Verified",
                degree: "BS Electrical Engineering",
                gpa: "3.24",
                gasUsed: "74,210 Gas (Batch)",
                blockNumber: 15483122,
              },
            ];

            // Prepend batch records and update stats counters
            setTransactions((prev) => [...bulkRecords, ...prev]);
            setTotalTxs((prev) => prev + 1); // 1 block write
            setRecordsStored((prev) => prev + 3); // 3 records
            setVerifiedStudents((prev) => prev + 3);

            setIsProcessingExcel(false);
            setExcelFile(null);
            setExcelProcessingStep("");
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // 2b. Handle Bulk Certificates PDF/PNG Selection & Process
  // frontend/src/dashboard/UniDashboard.jsx
  // Replace these functions with real API integration

  // ============================================================
  // BULK FILES UPLOAD - REAL API
  // ============================================================

  const handleBulkFilesUpload = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      // Validate each file
      const validFiles = selected.filter((file) => {
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "application/pdf",
        ];
        if (!allowedTypes.includes(file.type)) {
          console.warn(`Skipping ${file.name}: Unsupported file type`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`Skipping ${file.name}: File too large (>10MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        alert(
          "No valid files selected. Please upload PNG, JPG, JPEG, or PDF files under 10MB.",
        );
        return;
      }

      setBulkFiles((prev) => [...prev, ...validFiles]);
      console.log(
        `📁 Added ${validFiles.length} files. Total: ${bulkFiles.length + validFiles.length}`,
      );
    }
  };

  const removeBulkFile = (indexToRemove) => {
    setBulkFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // frontend/src/dashboard/UniDashboard.jsx
  // Update the executeBulkDocsProcess function

  const executeBulkDocsProcess = async () => {
    if (bulkFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    // Max 50 files
    if (bulkFiles.length > 50) {
      alert(
        "Maximum 50 files allowed per batch. Please split into smaller batches.",
      );
      return;
    }

    setIsProcessingBulkDocs(true);
    setBulkDocsProcessingStep(`Preparing ${bulkFiles.length} files...`);

    const formData = new FormData();
    bulkFiles.forEach((file) => {
      formData.append("certificates", file);
    });

    try {
      setBulkDocsProcessingStep(
        `Uploading ${bulkFiles.length} files to server...`,
      );

      const response = await API.post("/certificates/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes
      });

      console.log("✅ Bulk Upload Response:", response.data);

      if (response.data.success) {
        const results = response.data.results || [];
        const errors = response.data.errors || [];

        // Update progress
        setBulkProgress({
          total: bulkFiles.length,
          processed: results.length + errors.length,
          succeeded: results.length,
          failed: errors.length,
        });

        setBulkDocsProcessingStep(
          `✅ ${results.length} certificates processed successfully!`,
        );

        // Add successful transactions
        results.forEach((cert) => {
          const newTx = {
            id: `tx-bulk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            student: cert.studentName || "Unknown",
            rollNumber: cert.registrationNumber || "N/A",
            hash: cert.certificateHash || "0x...",
            time: new Date().toLocaleTimeString(),
            type: "Bulk Import",
            status: "Verified",
            degree: cert.degree || "N/A",
            gasUsed: "~45,000 Gas",
            blockNumber: cert.blockNumber || 0,
          };
          setTransactions((prev) => [newTx, ...prev]);
        });

        // Update stats
        const successCount = results.length;
        if (successCount > 0) {
          setTotalTxs((prev) => prev + successCount);
          setRecordsStored((prev) => prev + successCount);
          setVerifiedStudents((prev) => prev + successCount);
        }

        // Show errors
        if (errors.length > 0) {
          console.warn("⚠️ Some files failed:", errors);
          const errorMessages = errors
            .map((e) => `${e.file}: ${e.error}`)
            .join("\n");
          setBulkDocsProcessingStep(
            `⚠️ ${results.length} succeeded, ${errors.length} failed.`,
          );
          // Optional: Show alert with details
          // alert(`Some files failed:\n${errorMessages}`);
        }

        // Clear files after successful upload
        setBulkFiles([]);

        // Reset progress after delay
        setTimeout(() => {
          setBulkProgress({ total: 0, processed: 0, succeeded: 0, failed: 0 });
        }, 5000);
      } else {
        setBulkDocsProcessingStep(
          "❌ Error: " + (response.data.message || "Upload failed"),
        );
      }
    } catch (error) {
      console.error("❌ Bulk upload error:", error);

      let errorMsg = error.response?.data?.message || error.message;

      // Handle specific multer errors
      if (errorMsg.includes("too many files")) {
        errorMsg = "Too many files. Maximum 50 files per batch.";
      } else if (errorMsg.includes("file too large")) {
        errorMsg = "One or more files exceed the 10MB limit.";
      }

      setBulkDocsProcessingStep("❌ Error: " + errorMsg);
    } finally {
      setTimeout(() => {
        setIsProcessingBulkDocs(false);
        if (
          !setBulkDocsProcessingStep.includes("✅") &&
          !setBulkDocsProcessingStep.includes("❌")
        ) {
          setBulkDocsProcessingStep("");
        }
      }, 3000);
    }
  };

  // 3. Handle Revoke Certificate Action
  const handleRevokeUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRevokeFile(e.target.files[0]);
    }
  };

  // executeRevocation function

  const executeRevocation = async () => {
    if (!selectedStudent || !revocationReasonInput) {
      alert("Please select a student and provide a reason for revocation.");
      return;
    }

    setIsProcessingRevoke(true);
    setRevokeProcessingStep("Preparing revocation request...");

    try {
      setRevokeProcessingStep("Sending to blockchain...");

      const response = await API.post(
        `/certificates/revoke/${selectedStudent.certificateHash}`,
        {
          reason: revocationReasonInput,
        },
      );

      if (response.data.success) {
        setRevokeProcessingStep("✅ Certificate revoked successfully!");

        // Update the transaction in the list
        setTransactions((prev) => {
          const updated = prev.map((tx) => {
            if (tx.hash === selectedStudent.certificateHash) {
              return {
                ...tx,
                status: "Revoked",
                revocationReason: revocationReasonInput,
                type: "Revocation",
              };
            }
            return tx;
          });
          return updated;
        });

        // Update stats
        setVerifiedStudents((prev) => Math.max(0, prev - 1));
        setTotalTxs((prev) => prev + 1);

        // Clear selections
        setSelectedStudent(null);
        setTargetRollToRevoke("");
        setRevocationReasonInput("");
        setSearchResults([]);

        setTimeout(() => {
          setIsProcessingRevoke(false);
          setRevokeProcessingStep("");
        }, 2000);
      } else {
        setRevokeProcessingStep(
          "❌ Error: " + (response.data.message || "Revocation failed"),
        );
        setTimeout(() => setIsProcessingRevoke(false), 3000);
      }
    } catch (error) {
      console.error("Revocation error:", error);
      setRevokeProcessingStep(
        "❌ Error: " + (error.response?.data?.message || error.message),
      );
      setTimeout(() => setIsProcessingRevoke(false), 3000);
    }
  };

  const navigate = useNavigate();

  // Safe logout by going back to login screen hash trigger
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      localStorage.removeItem("user");
      navigate("/institution-signin", { replace: true });
    }
  };

  // Search Filter implementation
  const filteredTransactions = transactions.filter((tx) => {
    const searchLow = searchTerm.toLowerCase();
    return (
      tx.student.toLowerCase().includes(searchLow) ||
      tx.rollNumber.toLowerCase().includes(searchLow) ||
      tx.hash.toLowerCase().includes(searchLow) ||
      (tx.degree && tx.degree.toLowerCase().includes(searchLow))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#002677] selection:text-white">
      {/* 1. Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <BlockCertLogo />
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          {/* Portal Scope Label */}
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-[#002677] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>University Dashboard</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Verification Portal
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-all border border-slate-200"
          id="btn-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Layout Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* 2. Top Interactive Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Transactions Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/85 hover:border-blue-200 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Write Transactions
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-3xl font-bold text-[#002677]">
                    {totalTxs.toLocaleString()}
                  </h2>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                    + Live
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                <Hash className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Total Blockchain Records Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/85 hover:border-blue-200 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Degrees Fixed on Blockchain
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-3xl font-bold text-[#002677]">
                    {recordsStored.toLocaleString()}
                  </h2>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                    Immutable
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                <Database className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Verified Active Students Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/85 hover:border-blue-200 transition-all group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Verified Students
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h2 className="text-3xl font-bold text-[#002677]">
                    {verifiedStudents.toLocaleString()}
                  </h2>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                    Clean Registry
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs Wrapper */}
        <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-1.5">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "upload" ?
                "bg-[#002677] text-white shadow-md shadow-blue-900/15"
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/70"
            }`}
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Single Issuance Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("bulk-docs")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "bulk-docs" ?
                "bg-[#002677] text-white shadow-md shadow-blue-900/15"
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/70"
            }`}
          >
            <Files className="w-4.5 h-4.5" />
            <span>Bulk Files Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("batch")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "batch" ?
                "bg-emerald-700 text-white shadow-md shadow-emerald-950/15"
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/70"
            }`}
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            <span>Batch Register Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("revoke")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "revoke" ?
                "bg-red-600 text-white shadow-md shadow-red-950/15"
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/70"
            }`}
          >
            <Ban className="w-4.5 h-4.5" />
            <span>Revocation Integrity Center</span>
          </button>
        </div>

        {/* 3b. Interactive Active Tab Split Content Layout */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "upload" && (
              <motion.div
                key="upload-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Tab Info Sidebar (5 Columns) */}
                <div className="lg:col-span-5 bg-[#002677]/[0.02] border border-blue-105 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#002677] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Methodology 01
                    </span>
                    <h3 className="text-xl font-bold text-[#002677] mt-3">
                      Single On-Chain Issuance Guide
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      Designed for deploying student degrees individually. This
                      action performs an instant OCR layout scanning sequence,
                      generates a cryptographical content certificate, and
                      broadcasts an immutable block state trace.
                    </p>

                    <div className="space-y-4 mt-6">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Drag/Select Transcript Document
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Supports raw certificate images or academic PDF
                            receipts.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Dynamic OCR Extraction
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Our smart layout scanner isolates Roll indexes, name
                            tokens, and degrees.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Compute SHA-256 State
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            A secure 256-bit cryptographic signature blocks
                            further manipulations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-[#002677] font-semibold bg-[#002677]/[0.04] p-3.5 rounded-xl border border-[#002677]/10">
                    <Info className="w-4 h-4 text-[#002677] shrink-0" />
                    <span>Cost parameter: ~42,000 transaction Gas units</span>
                  </div>
                </div>

                {/* Interactive Card Widget (7 Columns) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">
                          Upload & Hashing Protocol
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          Single credential broadcast system
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      Select or drop the student's physical transcript image. On
                      clicking, simulated nodes process metadata and link block
                      values dynamically.
                    </p>

                    {/* Upload Dropzone Box */}
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-[#002677] bg-slate-50/50 rounded-xl p-6 sm:p-8 transition-all text-center group cursor-pointer">
                      <input
                        type="file"
                        onChange={handleCertificateUpload}
                        disabled={isProcessingCert}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,image/*"
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-all text-slate-400 group-hover:text-[#002677]">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-800">
                          {certificateFile ?
                            certificateFile.name
                          : "Drag & Drop PDF or Click to upload"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          PDF, PNG, JPG format (Max size: 5MB)
                        </p>
                      </div>
                    </div>

                    {/* Animated Progress Indicator */}
                    <AnimatePresence>
                      {isProcessingCert && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-105 flex flex-col gap-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-xs font-bold text-[#002677] animate-pulse">
                              Transmitting To Block Ledger...
                            </span>
                            <div className="w-4 h-4 border-2 border-[#002677] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-[11px] font-mono text-slate-600 leading-snug">
                            → {certProcessingStep}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Instant pre-processing confirmation feedback */}
                    {!isProcessingCert && certificateFile && (
                      <div className="mt-5 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 select-none shrink-0">
                          ✓
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-green-850 truncate">
                            {certificateFile.name}
                          </p>
                          <p className="text-[10px] text-green-600 font-semibold">
                            Ready for cryptographic hashing sequence
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={executeCertificateExtraction}
                    disabled={!certificateFile || isProcessingCert}
                    className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                      certificateFile && !isProcessingCert ?
                        "bg-[#002677] text-white hover:bg-[#00174a] shadow-lg shadow-blue-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Extract & Store Hash</span>
                  </button>
                </div>
              </motion.div>
            )}
            {activeTab === "bulk-docs" && (
              <motion.div
                key="bulk-docs-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Tab Info Sidebar (5 Columns) */}
                <div className="lg:col-span-5 bg-[#002677]/[0.02] border border-[#002677]/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#002677] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      Methodology 01-B
                    </span>
                    <h3 className="text-xl font-bold text-[#002677] mt-3">
                      Bulk Certificate Ingestion Specs
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      Mass digest physical certificates (images and PDF files)
                      in a single workflow. Our engine executes parallel OCR
                      threads to hash roll identifiers, map credential status
                      flags, and finalize block storage records.
                    </p>

                    <div className="space-y-4 mt-6">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Select Multiple Certificate Docs
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Drag and drop or select multiple PDF/PNG/JPEG
                            transcripts in one batch.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Concurrent OCR Mapping
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            The scanner parses key variables (Roll ID, Name) for
                            each file concurrently.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Commit Ledger Tree
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Hashed credentials are wrapped inside a secure,
                            shared block transition.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-[#002677] font-semibold bg-[#002677]/[0.04] p-3.5 rounded-xl border border-[#002677]/10">
                    <Info className="w-4 h-4 text-[#002677] shrink-0" />
                    <span>
                      Calculated limit: Over 100 media uploads per batch
                      execution
                    </span>
                  </div>
                </div>

                {/* Interactive Card Widget (7 Columns) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center shadow-sm">
                        <Files className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">
                          Bulk Verification Storage
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          PNG or PDF Direct Media Ingestion
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      Select multiple graduating documents to upload. Processed
                      credentials will be converted into dynamic hashes and
                      committed to the block live ledger.
                    </p>

                    {/* Multi Upload Dropzone */}
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-[#002677] bg-slate-50/50 rounded-xl p-6 sm:p-8 transition-all text-center group cursor-pointer">
                      <input
                        type="file"
                        onChange={handleBulkFilesUpload}
                        disabled={isProcessingBulkDocs}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,image/png,image/jpeg"
                        multiple
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-all text-slate-400 group-hover:text-[#002677]">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-800">
                          Select multiple PDFs/PNG Images
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Drag or select PDF, PNG, JPG (Multiple files
                          supported)
                        </p>
                      </div>
                    </div>

                    {/* Queued Files List */}
                    {bulkFiles.length > 0 && (
                      <div className="mt-6 border border-slate-150 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                        <div className="bg-slate-50 border-b border-slate-150 px-4 py-2.5 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Queued Certificates ({bulkFiles.length})
                          </span>
                          <button
                            onClick={() => setBulkFiles([])}
                            disabled={isProcessingBulkDocs}
                            className="text-[10px] text-red-500 font-extrabold hover:underline select-none"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {bulkFiles.map((file, index) => (
                            <div
                              key={index}
                              className="px-4 py-2.5 flex items-center justify-between text-xs bg-white hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="font-semibold text-slate-700 truncate">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <button
                                onClick={() => removeBulkFile(index)}
                                disabled={isProcessingBulkDocs}
                                className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-all hover:bg-slate-100 shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Animated Bulk Progress Details */}
                    <AnimatePresence>
                      {isProcessingBulkDocs && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-105 flex flex-col gap-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-xs font-bold text-[#002677] animate-pulse">
                              Processing Bulk Certificates Ingestion...
                            </span>
                            <div className="w-4 h-4 border-2 border-[#002677] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-[11px] font-mono text-slate-600 leading-snug">
                            → {bulkDocsProcessingStep}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Bulk Progress Indicator */}
                  {isProcessingBulkDocs && bulkProgress.total > 0 && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progress:</span>
                        <span>
                          {bulkProgress.succeeded} succeeded,{" "}
                          {bulkProgress.failed} failed
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-[#002677] h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(bulkProgress.processed / bulkProgress.total) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {bulkProgress.processed} of {bulkProgress.total}{" "}
                        processed
                      </p>
                    </div>
                  )}
                  <button
                    onClick={executeBulkDocsProcess}
                    disabled={bulkFiles.length === 0 || isProcessingBulkDocs}
                    className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                      bulkFiles.length > 0 && !isProcessingBulkDocs ?
                        "bg-[#002677] text-white hover:bg-[#00174a] shadow-lg shadow-blue-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Hashing All ({bulkFiles.length} files)</span>
                  </button>
                </div>
              </motion.div>
            )}
            {activeTab === "batch" && (
              <motion.div
                key="batch-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Tab Info Sidebar (5 Columns) */}
                <div className="lg:col-span-5 bg-emerald-50/[0.04] border border-emerald-105 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Methodology 02
                    </span>
                    <h3 className="text-xl font-bold text-emerald-800 mt-3">
                      Batch Register Protocol Specs
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      Optimize deployment speeds using spreadsheets. Ideal for
                      publishing batch records for entire graduation sets,
                      saving up to 80% on transactional decentralized system
                      overhead.
                    </p>

                    <div className="space-y-4 mt-6">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            CSV Structure Layout
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Form sheet columns mapping student identities, roll
                            codes, and GPA ratios.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Merkle Tree Compilation
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Aggregates batch arrays into a single high-integrity
                            root checkpoint.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Consolidated Block Write
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Launches multi-tier verifications across a single
                            Smart Contract command.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-500/10">
                    <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Calculated throughput limit: 1,000 blocks per transaction
                      trigger
                    </span>
                  </div>
                </div>

                {/* Interactive Card Widget (7 Columns) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
                        <FileSpreadsheet className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">
                          Batch Spreadsheet Enrollment
                        </h4>
                        <p className="text-xs text-slate-400 font-medium font-mono">
                          Bulk batch node ingestion
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      Publish lists of graduating students. Provide a list with
                      Name, Roll Number, and Degree variables.
                    </p>

                    {/* Upload Dropzone Box */}
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 bg-slate-50/50 rounded-xl p-6 sm:p-8 transition-all text-center group cursor-pointer animate-fade-in">
                      <input
                        type="file"
                        onChange={handleExcelUpload}
                        disabled={isProcessingExcel}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".csv,.xls,.xlsx"
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-all text-slate-400 group-hover:text-emerald-700">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-800">
                          {excelFile ?
                            excelFile.name
                          : "Choose Batch spreadsheet (.csv, .xlsx)"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Excel tables with Name/Roll columns
                        </p>
                      </div>
                    </div>

                    {/* Animated Progress Indicator */}
                    <AnimatePresence>
                      {isProcessingExcel && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col gap-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-xs font-bold text-emerald-800 animate-pulse">
                              Hashing Batch Array Root...
                            </span>
                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-[11px] font-mono text-emerald-700 leading-snug">
                            → {excelProcessingStep}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Instant pre-processing confirmation feedback */}
                    {!isProcessingExcel && excelFile && (
                      <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 select-none shrink-0">
                          ✓
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-emerald-850 truncate">
                            {excelFile.name}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Ready to digest multi-line array rows
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={executeBulkImport}
                    disabled={!excelFile || isProcessingExcel}
                    className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                      excelFile && !isProcessingExcel ?
                        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Publish Batch Records</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "revoke" && (
              <motion.div
                key="revoke-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Tab Info Sidebar (5 Columns) */}
                <div className="lg:col-span-5 bg-red-50/[0.04] border border-red-105 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Security Protocol 03
                    </span>
                    <h3 className="text-xl font-bold text-red-600 mt-3">
                      Revocation Process Standard
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      Update blockchain parameters to invalidate verified
                      hashes. This action modifies on-chain registries, warning
                      subsequent verifications in real-time.
                    </p>

                    <div className="space-y-4 mt-6">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-105 flex items-center justify-center text-xs font-bold text-red-600 shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Search & Select Student
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Search by Name or Registration Number to find the
                            certificate.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-105 flex items-center justify-center text-xs font-bold text-red-600 shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Assign Reason Code
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Document official reasons (e.g. metadata discrepancy
                            or credit revision).
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-105 flex items-center justify-center text-xs font-bold text-red-600 shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Set Revoked State (0xEE)
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Commit change code directly. Future validation
                            triggers yield instantaneous failure checks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50/20 p-3.5 rounded-xl border border-red-500/10">
                    <Info className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      Calculated security: Deployed onto immediate transaction
                      pipelines
                    </span>
                  </div>
                </div>

                {/* Interactive Card Widget (7 Columns) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Ban className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-red-600">
                          Revocation Management Protocol
                        </h4>
                        <p className="text-xs text-slate-400 font-medium pb-2">
                          Search, select, and revoke certificates
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      Search for a student by Name or Registration Number.
                      Select the certificate and provide a reason for
                      revocation.
                    </p>

                    {/* Search Section */}
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Search Student by Name or Registration Number
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Type name or registration number..."
                            value={targetRollToRevoke}
                            onChange={async (e) => {
                              const value = e.target.value;
                              setTargetRollToRevoke(value);

                              // Search for students
                              if (value.length >= 2) {
                                try {
                                  const response = await API.get(
                                    `/certificates/search-students?query=${encodeURIComponent(value)}`,
                                  );
                                  if (response.data.success) {
                                    setSearchResults(response.data.students);
                                  }
                                } catch (error) {
                                  console.error("Search error:", error);
                                }
                              } else {
                                setSearchResults([]);
                              }
                            }}
                            className="w-full pl-9 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none text-slate-700 focus:border-red-400 focus:ring-1 focus:ring-red-100 focus:bg-white transition-all"
                          />
                          {targetRollToRevoke && (
                            <button
                              onClick={() => {
                                setTargetRollToRevoke("");
                                setSearchResults([]);
                                setSelectedStudent(null);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                          <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            Found {searchResults.length} student(s)
                          </div>
                          {searchResults.map((student) => (
                            <div
                              key={student._id}
                              onClick={() => {
                                setSelectedStudent(student);
                                setTargetRollToRevoke(
                                  `${student.studentName} (${student.registrationNumber})`,
                                );
                                setSearchResults([]);
                              }}
                              className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 flex justify-between items-center"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {student.studentName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Reg: {student.registrationNumber} | Roll:{" "}
                                  {student.rollNumber}
                                </p>
                              </div>
                              <span className="text-xs text-slate-400">
                                {student.degree}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Selected Student Display */}
                      {selectedStudent && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              {selectedStudent.studentName}
                            </p>
                            <p className="text-xs text-green-600">
                              Reg: {selectedStudent.registrationNumber} | Hash:{" "}
                              {selectedStudent.certificateHash?.substring(
                                0,
                                16,
                              )}
                              ...
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedStudent(null);
                              setTargetRollToRevoke("");
                            }}
                            className="text-green-600 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Revocation Reason */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Official Invalidation Reason
                        </label>
                        <input
                          type="text"
                          value={revocationReasonInput}
                          onChange={(e) =>
                            setRevocationReasonInput(e.target.value)
                          }
                          placeholder="Falsified documentation, data discrepancy etc..."
                          className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none text-slate-700 focus:border-red-400 focus:ring-1 focus:ring-red-100 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Animated Progress Indicator */}
                    <AnimatePresence>
                      {isProcessingRevoke && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-5 p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col gap-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-xs font-bold text-red-800 animate-pulse">
                              Committing Off-chain Status Updates...
                            </span>
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-[11px] font-mono text-red-700 leading-snug">
                            → {revokeProcessingStep}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={executeRevocation}
                    disabled={
                      !selectedStudent ||
                      !revocationReasonInput ||
                      isProcessingRevoke
                    }
                    className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                      (
                        selectedStudent &&
                        revocationReasonInput &&
                        !isProcessingRevoke
                      ) ?
                        "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                    <span>Revoke Certificate Now</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transaction Registry Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#002677]">
                Last Blockchain Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Recent student degrees hashed and committed to ledger block
                roots. Click any transaction to inspect proof.
              </p>
            </div>

            {/* Live Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Student, Roll, Hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 h-10 w-full sm:w-64 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#002677] focus:ring-1 focus:ring-[#002677]/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-4 px-6">Student Information</th>
                  <th className="py-4 px-4">Transaction hash</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Time Added</th>
                  <th className="py-4 px-4 text-center">Ledger status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {filteredTransactions.length === 0 ?
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400 text-sm"
                      >
                        {searchTerm ?
                          "No transactions match your search query filter. Try another Roll Number."
                        : "No transactions yet. Upload a certificate to get started!"
                        }
                      </td>
                    </tr>
                  : filteredTransactions.slice(0, 10).map((item) => (
                      <tr
                        key={item.id || item.hash}
                        onClick={() => setSelectedTx(item)}
                        className="hover:bg-blue-50/40 transition-all duration-150 cursor-pointer group"
                      >
                        {/* Student Information */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-slate-800 text-sm group-hover:text-[#002677] transition-all">
                              {item.student}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>Roll: {item.rollNumber}</span>
                              {item.degree && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>{item.degree}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cryptographic Hash */}
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 px-2.5 py-1 rounded text-[#002677]/90 group-hover:bg-blue-100/50 transition-all font-semibold">
                              {item.hash?.substring(0, 14)}...
                            </span>
                          </div>
                        </td>

                        {/* Transaction Type */}
                        <td className="py-4 px-4 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${
                              item.type === "Revocation" ?
                                "bg-red-50 text-red-600 border border-red-100"
                              : item.type === "Bulk Import" ?
                                "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {item.type || "Upload"}
                          </span>
                        </td>

                        {/* Transaction Time */}
                        <td className="py-4 px-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.time}</span>
                          </div>
                        </td>

                        {/* Ledger Status */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                              item.status === "Verified" ?
                                "bg-green-100 text-green-700"
                              : item.status === "Revoked" ?
                                "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "Verified" ? "bg-green-500"
                                : item.status === "Revoked" ?
                                  "bg-red-500 animate-ping"
                                : "bg-yellow-500"
                              }`}
                            />
                            {item.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {transactions.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-3 text-right">
              * Showing latest {Math.min(filteredTransactions.length, 10)} of{" "}
              {filteredTransactions.length} transactions. Click any row to
              inspect proof.
            </p>
          )}
        </div>

        {/* 5. Immutable Ledger Verification Notice Indicator */}
        <div className="bg-[#002677] rounded-2xl p-6 text-white shadow-[#002677]/10 shadow-xl border border-[#001c59]">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
              <Database className="w-6 h-6 text-blue-200" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                <span>Secure Decentralized Blockchain Storage Enabled</span>
                <span className="text-[10px] bg-sky-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                  No Primary DB Required to Verify
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed md:max-w-4xl">
                This verification portal is designed to prevent systemic
                credentials forgery. When transcripts are stored, they bypass
                standard databases for queries; rather, the hashed content is
                written directly inside a decentralized immutable Merkle Tree.
                Inquirers can immediately cross-match a transcript block root
                without storing physical student identities, preserving student
                database anonymity, and upholding structural educational
                integrity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* --- PREMIUM DYNAMIC BLOCK DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Modal Banner Title */}
              <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-sm tracking-wider uppercase font-mono">
                    Block Ledger Receipt
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Receipt Contents */}
              <div className="p-6 space-y-4">
                {/* Header info */}
                <div className="border-b border-slate-100 pb-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedTx.status === "Verified" ?
                        "bg-green-100 text-green-700"
                      : selectedTx.status === "Revoked" ?
                        "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedTx.status === "Verified" ?
                      "Verified Immutable Root"
                    : selectedTx.status === "Revoked" ?
                      "Status: Revoked Reference"
                    : "Status: Pending"}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#002677] mt-2">
                    {selectedTx.student}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student Roll No: {selectedTx.rollNumber}
                  </p>
                </div>

                {/* Cryptographic metadata blocks */}
                <div className="space-y-3">
                  {/* Ledger Hash */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Immutable Content Block Hash
                    </div>
                    <div className="text-xs font-mono text-[#002677] select-all break-all font-semibold mt-1">
                      {selectedTx.hash}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Degree */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Degree Field
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                        {selectedTx.degree || "N/A"}
                      </div>
                    </div>

                    {/* GPA */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Cumulative GPA
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1">
                        {selectedTx.gpa || "N/A"} / 4.00
                      </div>
                    </div>

                    {/* Block height */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Block Height
                      </div>
                      <div className="text-xs font-mono font-semibold text-slate-700 mt-1">
                        #{selectedTx.blockNumber || "Pending"}
                      </div>
                    </div>

                    {/* Gas spent */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Gas Limit Used
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 mt-1">
                        {selectedTx.gasUsed || "~45,000 Gas"}
                      </div>
                    </div>
                  </div>

                  {/* Merkle Proof Validation Chain preview */}
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] leading-relaxed">
                    <p className="text-blue-400 font-bold mb-1">
                      // Standard Merkle Tree Proof Path:
                    </p>
                    <p>
                      Leaf Link Code [0]: sha256("{selectedTx.student}:{" "}
                      {selectedTx.rollNumber}")
                    </p>
                    <p>Sibling hash [L1]: "0x6f2a...88bc"</p>
                    <p>Intermediate Parent Node [L2]: "0xfa11...7a29"</p>
                    <p className="text-green-400">
                      State Root Hash verified on block:{" "}
                      {selectedTx.status === "Verified" ? "TRUE ✓" : "FALSE ✗"}
                    </p>
                  </div>

                  {/* Revocation Warning if status is revoked */}
                  {selectedTx.status === "Revoked" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                      <ShieldAlert className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-red-800">
                          Reason for Revocation
                        </div>
                        <p className="text-xs text-red-750 mt-0.5 leading-relaxed">
                          {selectedTx.revocationReason ||
                            "Administrative invalidation."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer close */}
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  >
                    Close Ledger Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};;;;;;;;

export default UniversityDashboard;
