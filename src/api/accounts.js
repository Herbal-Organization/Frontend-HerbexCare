import httpClient from "./httpClient";

export const registerAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/register", payload);
  return data;
};

export const loginAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/login", payload);
  return data;
};

export const resetPasswordAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/reset-password", payload);
  return data;
};

export const forgotPasswordAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/forgot-password", payload);
  return data;
};

export const refreshAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/refresh", payload);
  return data;
};

export const logoutAccount = async (payload) => {
  const { data } = await httpClient.post("/api/Accounts/logout", payload);
  return data;
};
