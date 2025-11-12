import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9000/api/v1/", 
  withCredentials: true,
  timeout: 30000, // 30 second timeout for production
});

export default axiosInstance;
