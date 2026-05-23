import { useState, useRef } from "react";
import {
  Building2,
  Mail,
  User,
  Phone,
  Globe,
  Award,
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  FileText,
  X,
  ChevronRight,
  AlertCircle,
  Clock,
  Send,
  Lock,
} from "lucide-react";
import BlockCertLogo from "../Header/BlockCertLogo";

const steps = [
  {
    number: 1,
    title: "Submit Enrollment Application",
    description:
      "Provide authorized email, domain, and accreditation files for proof of registration.",
    active: true,
  },
  {
    number: 2,
    title: "Manual Verification Audit",
    description:
      "Our regulatory board processes the submission of administrative documents & authority roles (under 24 hours).",
    active: false,
  },
  {
    number: 3,
    title: "Credential Generation",
    description:
      "Once verified, we auto-generate secure, random Institutional access IDs stored on-ledger.",
    active: false,
  },
  {
    number: 4,
    title: "Get Credential Package",
    description:
      "Your primary contact person receives an automated secure link to establish their on-chain account.",
    active: false,
  },
];

const UniversityEnrollment = () => {
  // Step states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    universityName: "",
    websiteUrl: "",
    accreditationId: "",
    country: "",
    city: "",
    repName: "",
    repRole: "",
    repEmail: "",
    repContact: "",
    docType: "Charter Document",
    monthlyCertificates: "100 - 500",
  });

  // File Upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Input Change
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // File Select
  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      setUploadedFile(file);
    }
  };

  // Drag Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      setUploadedFile(file);
    }
  };

  // Remove file
  const removeFile = () => {
    setUploadedFile(null);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white w-full pt-4 pl-8 pr-6 pb-4 border-b border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0 ">
        <BlockCertLogo />
      </div>
      {/* MAIN */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 grid lg:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* INFO CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <div className="flex items-center gap-2 text-color-primary bg-blue-50 max-w-fit px-4 rounded-full font-semibold mb-4">
              <Building2 className="size-5" />
              University Enrollment
            </div>

            <h2 className="text-3xl font-bold text-color-primary mb-4">
              Enroll Your Institution
            </h2>

            <p className="text-slate-500 text-sm leading-relaxed">
              Submit your university details and verification documents to join
              our blockchain-based certificate verification platform.
            </p>

            <div className="mt-8 space-y-5">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div
                    className={`w-6 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.active ?
                        "bg-[#002677] text-white"
                      : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.number}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {step.title}
                    </h4>

                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECURITY CARD */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
              <Lock className="size-48" />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Award className="text-blue-400 size-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Trust Guarantee
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              BlockVerify-AI enforces end-to-end security compliance. We verify
              institution-level domain names to guard against falsified
              certifications.
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-500">
                ACCERDITED INSTITUTIONS REVENUE-GRADE PROTECTION
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10">
          {!isSubmitted ?
            <>
              {/* STEP INDICATOR */}
              <div className="flex items-center gap-4 mb-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === 1 ?
                      "bg-[#002677] text-white"
                    : "bg-emerald-500 text-white"
                  }`}
                >
                  {currentStep > 1 ?
                    <CheckCircle2 className="size-5" />
                  : "1"}
                </div>

                <div className="h-0.5 flex-1 bg-slate-200"></div>

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === 2 ?
                      "bg-[#002677] text-white"
                    : "bg-slate-200 text-slate-500"
                  }`}
                >
                  2
                </div>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                      Institution Information
                    </h3>

                    {/* UNIVERSITY NAME */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        University Name
                      </label>

                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                        <input
                          type="text"
                          id="universityName"
                          value={formData.universityName}
                          onChange={handleChange}
                          placeholder="University Name"
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* WEBSITE */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Website URL
                      </label>

                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                        <input
                          type="url"
                          id="websiteUrl"
                          value={formData.websiteUrl}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* ACCREDITATION */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Accreditation ID
                      </label>

                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                        <input
                          type="text"
                          id="accreditationId"
                          value={formData.accreditationId}
                          onChange={handleChange}
                          placeholder="HEC-12345"
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* COUNTRY + CITY */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 text-sm font-semibold">
                          Country
                        </label>

                        <input
                          type="text"
                          id="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Pakistan"
                          className="w-full h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold">
                          City
                        </label>

                        <input
                          type="text"
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Lahore"
                          className="w-full h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* WARNING */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="size-5 text-amber-600 shrink-0" />

                      <p className="text-sm text-amber-700">
                        Please use official university information and domain
                        email addresses only.
                      </p>
                    </div>

                    {/* NEXT BUTTON */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary text-white px-6 py-3 rounded-xl flex items-center gap-2"
                      >
                        Next: <span>Verification Details</span>
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                      Verification Details
                    </h3>

                    {/* REP NAME */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Representative Name
                      </label>

                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                        <input
                          type="text"
                          id="repName"
                          value={formData.repName}
                          onChange={handleChange}
                          placeholder="Representative Name"
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Official Email
                      </label>

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                        <input
                          type="email"
                          id="repEmail"
                          value={formData.repEmail}
                          onChange={handleChange}
                          placeholder="admin@university.edu"
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* PHONE */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Phone Number
                      </label>

                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                        <input
                          type="text"
                          id="repContact"
                          value={formData.repContact}
                          onChange={handleChange}
                          placeholder="+92 300 1234567"
                          className="w-full h-12 border border-slate-200 rounded-xl pl-11 pr-4 outline-none focus:border-[#002677]"
                          required
                        />
                      </div>
                    </div>

                    {/* FILE UPLOAD */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Upload Verification Document
                      </label>

                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                          isDragging ?
                            "border-[#002677] bg-blue-50"
                          : "border-slate-300"
                        }`}
                      >
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                        />

                        {!uploadedFile ?
                          <>
                            <UploadCloud className="size-10 text-slate-400 mx-auto mb-4" />

                            <p className="font-semibold text-slate-700">
                              Drag & Drop file here
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              PDF, JPG, PNG
                            </p>
                          </>
                        : <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FileText className="size-6 text-color-primary" />

                              <div className="text-left">
                                <p className="text-sm font-semibold">
                                  {uploadedFile.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-red-500"
                            >
                              <X className="size-5" />
                            </button>
                          </div>
                        }
                      </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="border border-slate-300 px-6 py-3 rounded-xl"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="bg-[#002677] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#001b55]"
                      >
                        Submit
                        <Send className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          : /* SUCCESS SCREEN */
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="size-10 text-emerald-500" />
              </div>

              <h2 className="text-3xl font-bold text-color-primary mb-4">
                Enrollment Submitted
              </h2>

              <p className="text-slate-500 max-w-lg mx-auto mb-8">
                Your university enrollment request has been submitted
                successfully. Our team will review your details shortly.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left max-w-xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="size-5 text-color-primary" />

                  <div>
                    <p className="font-semibold">Estimated Review Time</p>

                    <p className="text-sm text-slate-500">
                      24 - 48 Business Hours
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-color-primary" />

                  <div>
                    <p className="font-semibold">Notification Email</p>

                    <p className="text-sm text-slate-500">
                      {formData.repEmail}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                }}
                className="mt-8 bg-[#002677] text-white px-8 py-3 rounded-xl hover:bg-[#001b55]"
              >
                Submit Another Application
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default UniversityEnrollment;
