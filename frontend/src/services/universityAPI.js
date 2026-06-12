import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This sends cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

export const universityAPI = {
  // Submit enrollment application (multipart form data)
  submitEnrollment: async (formData) => {
    try {
      const response = await API.post("/university/enroll", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get pending applications
  getPendingApplications: async () => {
    try {
      const response = await API.get("/university/pending");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all applications
  getAllApplications: async (status, page = 1, limit = 10) => {
    try {
      const response = await API.get("/university/applications", {
        params: { status, page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get application by ID
  getApplicationById: async (id) => {
    try {
      const response = await API.get(`/university/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve application
  approveApplication: async (id, adminNotes) => {
    try {
      const response = await API.put(`/university/${id}/approve`, {
        adminNotes,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject application
  rejectApplication: async (id, rejectionReason) => {
    try {
      const response = await API.put(`/university/${id}/reject`, {
        rejectionReason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const response = await API.get("/university/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const adminAPI = {
  // Check admin status
  checkAdminStatus: async () => {
    try {
      const response = await API.get("/admin/check-status");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin profile
  getAdminProfile: async () => {
    try {
      const response = await API.get("/admin/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default API;
