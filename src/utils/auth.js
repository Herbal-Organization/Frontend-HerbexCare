import {
  clearAuthTokens,
  endAuthSession,
  getAccessToken,
  getRefreshToken,
  revokeRefreshTokenOnServer,
} from "@features/auth/services/authSession";

// Auth utility functions
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const normalizeUserRole = (role) => {
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

export const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  // Map common Microsoft identity claims to simple properties
  return {
    ...decoded,
    name:
      decoded.name ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
    email:
      decoded.email ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
    role: normalizeUserRole(
      decoded.role ||
        decoded.Role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    ),
    phone:
      decoded.phone ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"
      ],
    userId:
      decoded.nameid ||
      decoded.sub ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
  };
};

export const getUserRole = () => {
  const user = getUserFromToken();
  return user?.role || null;
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const decoded = decodeJWT(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Sign out immediately: clear local session and hard-navigate to login.
 * Server revoke runs in the background so a slow API cannot block logout.
 */
export const logout = () => {
  const refreshToken = getRefreshToken();
  clearAuthTokens();
  revokeRefreshTokenOnServer(refreshToken);
  window.location.replace("/auth/login");
};
