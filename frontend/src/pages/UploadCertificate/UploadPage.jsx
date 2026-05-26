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
} from "lucide-react";
import VerifyInfoSection from "./VerifyInfoSection";

const CertificateUpload = () => {
  // Track whether user is dragging files over the upload area
  const [dragActive, setDragActive] = useState(false);

  // Store uploaded files
  const [files, setFiles] = useState([]);

  // Reference to hidden file input
  const inputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Handle file selection from file picker
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  // Add valid files to state
  const addFiles = (newFiles) => {
    // Allow only PDF, JPG, JPEG, PNG
    const validFiles = newFiles.filter((file) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
    );

    // Convert files into objects with extra information
    const formattedFiles = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).slice(2, 11),
      status: "completed",
      progress: 100,
    }));

    // Add new files to existing files
    setFiles((prevFiles) => [...prevFiles, ...formattedFiles]);
  };

  // Remove file by id
  const removeFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((fileInfo) => fileInfo.id !== id));
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
            Drop your digital assets here to verify their authenticity. We
            support PDF, JPG, and PNG formats.
          </motion.p>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`relative group h-80 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 bg-white overflow-hidden cursor-pointer ${
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
          {/* Hidden File Input */}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
          />

          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-900 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-900 blur-3xl" />
          </div>

          {/* Upload Content */}
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
                {/* Left Side */}
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

                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {(fileInfo.file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                      {fileInfo.status}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500" />

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

        {/* Verify Button */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-lg font-semibold flex items-center justify-center group transition-colors">
              <span>
                Verify {files.length}{" "}
                {files.length === 1 ? "Certificate" : "Certificates"}
              </span>
              <AlertCircle className="ml-2 size-5 group-hover:rotate-12 transition-transform" />
            </button>

            <p className="text-center text-slate-400 text-xs mt-4">
              By clicking verify, you agree to our{" "}
              <span className="underline cursor-pointer hover:text-slate-600 transition-colors">
                Terms of Service
              </span>
              .
            </p>
          </motion.div>
        )}
      <VerifyInfoSection />
      </div>
    </section>
  );
};

export default CertificateUpload;
