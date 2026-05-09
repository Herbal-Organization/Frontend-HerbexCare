import httpClient from "./httpClient";

export const getAllUsers = async () => {
  const { data } = await httpClient.get("/api/Users/get-all");
  return data;
};

export const getUserById = async (id) => {
  const { data } = await httpClient.get(`/api/Users/get/${id}`);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await httpClient.put(`/api/Users/update/${id}`, payload);
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
  const { data } = await httpClient.delete(`/api/Users/delete/${id}`);
  return data;
};
