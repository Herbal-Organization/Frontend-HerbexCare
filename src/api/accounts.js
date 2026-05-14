import httpClient from "./httpClient";

export const registerAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/register", payload);
  return data;
};

export const confirmEmail = async (email, token) => {
  const { data } = await httpClient.get("/api/Accounts/confirm-email", {
    params: { email, token },
  });
  return data;
};

export const resendConfirmationEmail = async (payload) => {
  const { data } = await httpClient.post(
    "/api/Accounts/resend-confirmation-email",
    payload,
  );
  return data;
};

export const loginAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/login", payload);
  return data;
};

export const resetPasswordAccount = async (payload) => {
  const { data } = await httpClient.post(
    "/api/Accounts/reset-password",
    payload,
  );
  return data;
};

export const forgotPasswordAccount = async (payload) => {
  const { data } = await httpClient.post(
    "/api/Accounts/forgot-password",
    payload,
  );
  return data;
};

export const googleLoginAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/google-login", payload);
  return data;
};

export const deleteAccount = async (userId) => {
  const { data } = await httpClient.delete(`/api/Users/delete/${userId}`);
  return data;
};
