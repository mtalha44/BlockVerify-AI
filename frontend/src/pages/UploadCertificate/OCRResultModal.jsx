import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Save,
  Loader2,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

const OCRResultModal = ({
  isOpen,
  onClose,
  ocrData,
  file,
  onVerify,
  isLoading,
}) => {
  // Initialize with ocrData when it changes
  const [editedData, setEditedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Update editedData when ocrData changes
  useEffect(() => {
    if (ocrData) {
      setEditedData({ ...ocrData });
    }
  }, [ocrData]);

  if (!isOpen) return null;

  // ONLY the 7 required fields (NO university_name)
  const fieldLabels = {
    student_name: "Student Name",
    father_name: "Father Name",
    registration_number: "Registration Number",
    roll_number: "Roll Number",
    degree: "Degree",
    session: "Session",
    cgpa: "CGPA",
  };

  // Required fields
  const requiredFields = ["student_name", "registration_number", "degree"];

  const handleFieldChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateFields = () => {
    const newErrors = {};

    requiredFields.forEach((field) => {
      const value = editedData[field]?.trim() || "";
      if (!value) {
        const label = fieldLabels[field] || field;
        newErrors[field] = `${label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateFields()) return;
    onVerify(editedData);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    // Clear errors when toggling edit mode
    if (isEditing) {
      setErrors({});
    }
  };

  const confidenceColor = (confidence) => {
    if (confidence > 80) return "text-emerald-600 bg-emerald-50";
    if (confidence > 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const renderField = (key, value) => {
    const label = fieldLabels[key] || key.replace(/_/g, " ").toUpperCase();
    const isRequired = requiredFields.includes(key);
    const hasError = errors[key] && touchedFields[key];
    const fieldValue = editedData[key] || "";

    return (
      <div key={key} className="space-y-1">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        {isEditing ?
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            onBlur={() => {
              setTouchedFields((prev) => ({ ...prev, [key]: true }));
              // Validate on blur
              if (isRequired && !fieldValue.trim()) {
                setErrors((prev) => ({
                  ...prev,
                  [key]: `${label} is required`,
                }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              hasError ?
                "border-red-500 ring-1 ring-red-500"
              : "border-slate-200 focus:border-blue-500"
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        : <div
            className={`px-3 py-2 rounded-lg text-sm min-h-[40px] flex items-center ${
              fieldValue ?
                "bg-slate-50 text-slate-700"
              : "bg-slate-50 text-slate-400 italic"
            }`}
          >
            {fieldValue || "Not extracted"}
          </div>
        }
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FileCheck className="size-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Verify Extracted Data
              </h3>
              <p className="text-sm text-slate-500">
                Please review and correct the extracted information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* File Info */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">File:</span>
            <span className="truncate max-w-[200px]">{file?.name}</span>
            <span className="text-slate-400">•</span>
            <span>{(file?.size / 1024).toFixed(1)} KB</span>
          </div>
          {ocrData?.confidence !== undefined && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceColor(ocrData.confidence)}`}
            >
              {ocrData.confidence}% Confidence
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(fieldLabels).map((key) =>
              renderField(key, editedData[key]),
            )}
          </div>

          {/* Edit Toggle */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              onClick={handleToggleEdit}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isEditing ?
                <>
                  <Save className="size-4" />
                  Done Editing
                </>
              : <>
                  <Edit2 className="size-4" />
                  Edit Fields
                </>
              }
            </button>
            <span className="text-xs text-slate-400">
              {isEditing ?
                "Click save when finished"
              : "Click Edit to make changes"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="size-4 text-blue-600" />
            <span>Data will be verified against blockchain</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ?
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying...
                </>
              : <>
                  <CheckCircle2 className="size-4" />
                  Verify & Submit
                </>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OCRResultModal;
