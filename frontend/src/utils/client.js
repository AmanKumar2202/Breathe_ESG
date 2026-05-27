import axios from "axios";

// Create the unified Axios instance pointing explicitly to your Django server
export const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // Ensure the trailing slash is present
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token automatically to every backend request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Catch unauthorized responses and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Clean HTTP Wrapper utilities used across your components and pages
export const get = (url, config) =>
  apiClient.get(url, config).then((res) => res.data);

export const post = (url, data, config) =>
  apiClient.post(url, data, config).then((res) => res.data);

export const patch = (url, data, config) =>
  apiClient.patch(url, data, config).then((res) => res.data);

export const postForm = (url, formData) =>
  apiClient
    .post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

// Default export ensures that file imports matching 'import apiClient from ...' stay fully operational
export default apiClient;
