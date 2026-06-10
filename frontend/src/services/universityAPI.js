import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const universityAPI = {
  // Submit enrollment application
  submitEnrollment: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/university/enroll`, formData, {
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
  getPendingApplications: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/university/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all applications
  getAllApplications: async (token, status, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/university/applications`, {
        params: { status, page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get application by ID
  getApplicationById: async (id, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/university/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Approve application
  approveApplication: async (id, adminNotes, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/university/${id}/approve`,
        { adminNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject application
  rejectApplication: async (id, rejectionReason, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/university/${id}/reject`,
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get statistics
  getStats: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/university/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const adminAPI = {
  // Check admin status
  checkAdminStatus: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/check-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin profile
  getAdminProfile: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
