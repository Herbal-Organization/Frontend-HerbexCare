import axios from "axios";
import { API_BASE_URL } from "@api/config";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const pickFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeRouteRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  if (normalizedRole === "patient") {
    return "Patient";
  }

  if (normalizedRole === "herbalist") {
    return "Herbalist";
  }

  if (
    normalizedRole === "superadmin" ||
    normalizedRole === "admin" ||
    normalizedRole === "super admin"
  ) {
    return "SuperAdmin";
  }

  return role || null;
};

const extractRoleFromAuthPayload = (payload) =>
  pickFirstValue(
    payload?.role,
    payload?.user?.role,
    payload?.data?.role,
    payload?.account?.role,
  );

export const storeAuthTokens = (tokens = {}) => {
  const { accessToken, refreshToken } = tokens;
  const resolvedAccessToken = pickFirstValue(
    accessToken,
    tokens.token,
    tokens.jwt,
    tokens.access_token,
  );
  const resolvedRefreshToken = pickFirstValue(
    refreshToken,
    tokens.refresh_token,
  );

  if (resolvedAccessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, resolvedAccessToken);
  }

  if (resolvedRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, resolvedRefreshToken);
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

export const getPostLoginRoute = (roleOrAuthPayload) => {
  const role =
    typeof roleOrAuthPayload === "object" && roleOrAuthPayload !== null
      ? extractRoleFromAuthPayload(roleOrAuthPayload)
      : roleOrAuthPayload;
  const normalizedRole = normalizeRouteRole(role);

  if (normalizedRole === "Patient") {
    return "/patient/dashboard";
  }

  if (normalizedRole === "Herbalist") {
    return "/herbalist/dashboard";
  }

  if (normalizedRole === "SuperAdmin") {
    return "/admin/dashboard";
  }

  return "/";
};
