import axios from "axios";
import { API_BASE_URL } from "./config";
import {
  clearAuthTokens,
  getAccessToken,
  refreshAuthSession,
} from "../services/authSession";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_EXCLUDED_PATHS = [
  "/api/Accounts/login",
  "/api/Accounts/register",
  "/api/Accounts/forgot-password",
  "/api/Accounts/reset-password",
  "/api/Accounts/refresh",
  "/api/Accounts/logout",
];

let refreshRequest = null;

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  const lang = localStorage.getItem("i18nextLng") || "en";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Accept-Language"] = lang;

  // Debug logging
  if (typeof window !== "undefined") {
    console.log(`[HTTP] ${config.method.toUpperCase()} ${config.url}`, {
      "Accept-Language": config.headers["Accept-Language"],
      params: config.params,
    });
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestPath = originalRequest?.url ?? "";
    const isExcludedPath = AUTH_EXCLUDED_PATHS.some((path) =>
      requestPath.includes(path),
    );

    // Log error details for debugging
    if (typeof window !== "undefined") {
      console.error(`[HTTP ERROR] ${status} ${requestPath}`, {
        data: error.response?.data,
        errors: error.response?.data?.errors,
      });
    }

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isExcludedPath
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= refreshAuthSession();
      const refreshedTokens = await refreshRequest;
      refreshRequest = null;

      if (refreshedTokens?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${refreshedTokens.accessToken}`;
      }

      return httpClient(originalRequest);
    } catch (refreshError) {
      refreshRequest = null;
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  },
);

export default httpClient;
