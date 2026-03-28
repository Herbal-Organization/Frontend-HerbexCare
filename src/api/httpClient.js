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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
