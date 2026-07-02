import axios from "axios";
import { API_BASE_URL } from "@api/config";
import { getUserRole, setStoredRole } from "@utils/auth";

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

export const revokeRefreshTokenOnServer = (refreshToken) => {
  if (!refreshToken) return;

  void axios
    .post(
      `${API_BASE_URL}/api/Accounts/logout`,
      { refreshToken },
      { timeout: 5000 },
    )
    .catch(() => {
      // Local session is already cleared; server revoke is best-effort.
    });
};

export const endAuthSession = async () => {
  const refreshToken = getRefreshToken();
  clearAuthTokens();

  if (!refreshToken) {
    return;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/Accounts/logout`,
      { refreshToken },
      { timeout: 5000 },
    );
  } catch {
    // Local session is already cleared.
  }
};

export const getPostLoginRoute = (role) => {
  if (role === "Patient") {
    return "/patient/dashboard";
  }

  if (role === "Herbalist") {
    return "/herbalist/dashboard";
  }

  if (role === "SuperAdmin") {
    return "/admin/dashboard";
  }

  return "/";
};

/**
 * Shared post-login logic used by both email/password and Google login flows.
 * Stores tokens, detects & persists the user role, then navigates to the
 * correct dashboard after a short delay.
 *
 * @param {object}  data           – Raw API response body from the login endpoint.
 * @param {function} navigate      – react-router navigate function.
 * @param {object}  [options]
 * @param {number}  [options.delay=1000]           – Milliseconds before navigating.
 * @param {function} [options.onBeforeNavigate]     – Callback fired right before navigation.
 */
export const handlePostLogin = (
  data,
  navigate,
  { delay = 1000, onBeforeNavigate } = {},
) => {
  if (!data) return;

  // Unwrap nested response (handles both flat and wrapped { data: {...} } formats)
  const payload = data.data ?? data;

  // Store tokens – handles multiple backend naming conventions
  const normalized = {
    accessToken:
      payload.accessToken ??
      payload.token ??
      payload.Token ??
      payload.access_token,
    refreshToken:
      payload.refreshToken ??
      payload.refresh_token ??
      payload.RefreshToken,
  };
  storeAuthTokens(normalized);

  // Detect and store role
  const detectedRole = payload.role ?? payload.Role ?? getUserRole();
  const validRoles = ["Patient", "Herbalist", "SuperAdmin"];
  const finalRole = validRoles.includes(detectedRole)
    ? detectedRole
    : "Patient";
  setStoredRole(finalRole);

  onBeforeNavigate?.();

  window.setTimeout(() => {
    navigate(getPostLoginRoute(finalRole));
  }, delay);
};
