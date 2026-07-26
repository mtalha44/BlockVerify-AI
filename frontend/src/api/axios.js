import axios from "axios";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: This sends cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - NO custom headers used for auth
API.interceptors.request.use(
  (config) => {
    // Cookies will be sent automatically via withCredentials

    // Debug logging
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Success: ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (import.meta.env.DEV) {
        console.error(`[API] Error ${status}: ${error.config?.url}`, data);
      }

      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }

      if (status === 403) {
        window.dispatchEvent(new CustomEvent("auth:forbidden"));
      }
    } else if (error.request) {
      console.error("[API] Network Error:", error.request);
      window.dispatchEvent(new CustomEvent("api:network-error"));
    } else {
      console.error("[API] Error:", error.message);
    }

    return Promise.reject(error);
  },
);

// Helper methods for file uploads
export const apiHelpers = {
  uploadFile: (url, file, onProgress, additionalData = {}) => {
    const formData = new FormData();
    formData.append("certificate", file);

    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    // Create a new instance for upload to avoid header conflicts
    const uploadAPI = axios.create({
      baseURL: API.defaults.baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return uploadAPI.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  uploadMultipleFiles: (url, files, onProgress, additionalData = {}) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("certificates", file);
    });

    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    const uploadAPI = axios.create({
      baseURL: API.defaults.baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return uploadAPI.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Certificate API endpoints
export const certificateAPI = {
  // OCR & VERIFICATION FLOW (For Regular Users)
  // Upload certificate for OCR extraction ONLY (no blockchain storage)
  // Used for: User verification flow where user reviews and corrects data
  uploadForOCR: (file, onProgress) => {
    return apiHelpers.uploadFile(
      "/certificates/upload-for-ocr",
      file,
      onProgress,
    );
  },

  // Upload and STORE on blockchain (For University Admin)
  // Used for: University Admin single upload - OCR + Blockchain storage
  uploadAndStore: (file, onProgress) => {
    return apiHelpers.uploadFile("/certificates/upload", file, onProgress);
  },

  // Verify certificate with corrected OCR data
  // After user edits the OCR data, this verifies against blockchain
  verifyWithOCR: (ocrData, originalData, fileInfo) => {
    return API.post("/certificates/verify-ocr", {
      ocrData,
      originalData,
      file: fileInfo,
    });
  },

  // 4. Verify certificate by hash
  verifyByHash: (hash) => {
    return API.get(`/certificates/verify/${hash}`);
  },

  // Bulk upload multiple certificates (University Admin)
  bulkUpload: (files, onProgress) => {
    return apiHelpers.uploadMultipleFiles(
      "/certificates/bulk-upload",
      files,
      onProgress,
    );
  },

  // QUERY OPERATIONS

  // Get all certificates with pagination and filters
  getCertificates: (params = {}) => {
    return API.get("/certificates/certificates", { params });
  },

  //  Get single certificate by ID
  getCertificate: (id) => {
    return API.get(`/certificates/certificate/${id}`);
  },

  // Get certificate statistics
  getStats: () => {
    return API.get("/certificates/stats");
  },

  // Get dashboard statistics
  getDashboardStats: () => {
    return API.get("/certificates/dashboard-stats");
  },

  // Search certificates
  searchCertificates: (query) => {
    return API.get("/certificates/search", { params: { query } });
  },

  // Search students for revocation
  searchStudents: (query) => {
    return API.get("/certificates/search-students", { params: { query } });
  },

  //  Revoke a certificate
  revokeCertificate: (hash, reason) => {
    return API.post(`/certificates/revoke/${hash}`, { reason });
  },
};

// Auth API endpoints
export const authAPI = {
  login: (email, password) => {
    return API.post("/auth/login", { email, password });
  },

  signup: (userData) => {
    return API.post("/auth/signup", userData);
  },

  logout: () => {
    return API.post("/auth/logout");
  },

  getProfile: () => {
    return API.get("/auth/me");
  },
};

export default API;
