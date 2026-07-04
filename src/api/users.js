import httpClient from "./httpClient";

export const getAllUsers = async (params = {}) => {
  const { data } = await httpClient.get("/api/Users/get-all", {
    params,
  });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await httpClient.get(`/api/Users/get/${id}`);
  return data;
};

export const getMyUserDetails = async (id) => {
  const { data } = await httpClient.get(`/api/Users/get/${id}`);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await httpClient.put(`/api/admin/users/${id}`, payload);
  return data;
};

export const updateUsersAddress = async (payload) => {
  return updateMyAddress(payload);
};

export const updateMyAddress = async (payload) => {
  const { data } = await httpClient.patch(
    `/api/Users/update-my-address`,
    payload,
  );
  return data;
};

export const updateMyFullName = async (payload) => {
  const { data } = await httpClient.patch(
    `/api/Users/update-my-fullname`,
    payload,
  );
  return data;
};

export const updateMyUserName = async (payload) => {
  const { data } = await httpClient.patch(
    `/api/Users/update-my-username`,
    payload,
  );
  return data;
};

export const createUser = async (payload) => {
  const { data } = await httpClient.post("/api/admin/users/add", payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await httpClient.delete(`/api/admin/users/${id}`);
  return data;
};
