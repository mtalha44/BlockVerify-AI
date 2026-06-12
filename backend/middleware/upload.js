// middleware/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const universityDir = path.join(uploadDir, "universities");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(universityDir)) {
  fs.mkdirSync(universityDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, universityDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, PNG, DOC, DOCX files are allowed"));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Configure for multiple files
export const uploadUniversityFiles = upload.fields([
  { name: "accreditationFile", maxCount: 1 },
  { name: "registrationFile", maxCount: 1 },
  { name: "authorityFile", maxCount: 1 },
]);

// Single file upload middleware
export const uploadSingle = upload.single("file");

// Multiple files upload middleware
export const uploadMultiple = upload.array("files", 10);
