import httpClient from "./httpClient";

export const getMyProfile = async () => {
  const { data } = await httpClient.get("/api/Patients/me");
  return data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await httpClient.put("/api/Patients/me", payload);
  return data;
};

export const getPatientById = async (id) => {
  const { data } = await httpClient.get(`/api/Patients/${id}`);
  return data;
};

export const getAllPatients = async () => {
  const { data } = await httpClient.get("/api/Patients/all");
  return data;
};
