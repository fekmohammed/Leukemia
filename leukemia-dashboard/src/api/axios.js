// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

API.interceptors.request.use((config) => {
  // Skip token for login and register
  if (
    config.url.includes("auth/token/login") ||
    config.url.includes("auth/users/") && config.method === "post"
  ) {
    return config;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default API;
