// frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token in headers
API.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        // You can also send token in header if needed
        // config.headers.Authorization = `Bearer ${userData.token}`;
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("user");
      // Don't auto-redirect here, let components handle it
    }
    return Promise.reject(error);
  },
);

export default API;
