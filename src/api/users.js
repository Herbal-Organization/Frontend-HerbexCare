import httpClient from "./httpClient";

export const getAllUsers = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/users", {
    params,
  });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await httpClient.get(`/api/admin/users/${id}`);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await httpClient.put(`/api/admin/users/${id}`, payload);
  return data;
};

export const updateUsersAddress = async (payload) => {
  const { data } = await httpClient.patch(
    `/api/Users/update-my-address`,
    payload,
  );
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await httpClient.delete(`/api/admin/users/${id}`);
  return data;
};
