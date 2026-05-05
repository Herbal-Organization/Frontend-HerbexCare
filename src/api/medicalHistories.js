import httpClient from "./httpClient";

export const myMedicalHistory = async () => {
  const { data } = await httpClient.get("/api/MedicalHistory/me");
  return data;
};

export const updateMyMedicalHistory = async (payload) => {
  const { data } = await httpClient.put("/api/MedicalHistory/me", payload);
  return data;
};

export const getPatientMedicalHistory = async (patientId) => {
  const { data } = await httpClient.get(
    `/api/MedicalHistories/patient/${patientId}`,
  );
  return data;
};
