import axios from "axios";
import { API_BASE_URL } from "../config";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (token && !error.config?.url?.includes("/auth/")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.message || fallback;
}

export default client;
