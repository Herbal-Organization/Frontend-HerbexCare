import axios from "axios";
import { API_BASE_URL } from "../api/config";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const storeAuthTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const refreshAuthSession = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data } = await axios.post(`${API_BASE_URL}/api/Accounts/refresh`, {
    refreshToken,
  });

  storeAuthTokens(data ?? {});
  return data;
};

export const endAuthSession = async () => {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await axios.post(`${API_BASE_URL}/api/Accounts/logout`, {
        refreshToken,
      });
    }
  } finally {
    clearAuthTokens();
  }
};

export const getPostLoginRoute = (role) => {
  if (role === "Patient") {
    return "/patient/dashboard";
  }

  if (role === "Herbalist") {
    return "/herbalist/dashboard";
  }

  return "/";
};
