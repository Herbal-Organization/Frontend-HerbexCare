import httpClient from "./httpClient";

export const getUserById = async (userId) => {
  const { data } = await httpClient.get(`/api/Users/get/${userId}`);
  return data;
};

export const getMyPatientProfile = async () => {
  const { data } = await httpClient.get("/api/Patients/me");
  return data;
};

export const updateMyPatientProfile = async (payload) => {
  const { data } = await httpClient.put("/api/Patients/me", payload);
  return data;
};

export const updateMyAddress = async (payload) => {
  const { data } = await httpClient.patch("/api/Users/update-my-address", payload);
  return data;
};

export const getMyMedicalHistory = async () => {
  const { data } = await httpClient.get("/api/MedicalHistories/me");
  return data;
};

export const upsertMyMedicalHistory = async (payload) => {
  const { data } = await httpClient.post("/api/MedicalHistories/me", payload);
  return data;
};
