import httpClient from "./httpClient";

export const getAllDiseases = async () => {
  const { data } = await httpClient.get("/api/Diseases/all");
  return data;
};

export const getAllDiseaseNames = async () => {
  const { data } = await httpClient.get("/api/Diseases/all-names");
  return data;
};

export const createDisease = async (payload) => {
  const { data } = await httpClient.post("/api/Diseases/propose", payload);
  return data;
};

export const addAdminDisease = async (payload) => {
  const { data } = await httpClient.post("/api/admin/diseases/add", payload);
  return data;
};

export const getPendingDiseases = async () => {
  const { data } = await httpClient.get("/api/admin/diseases/pending");
  return data;
};

export const approveDisease = async (id) => {
  const { data } = await httpClient.patch(
    `/api/admin/diseases/${id}/approve`,
  );
  return data;
};

export const rejectDisease = async (id) => {
  const { data } = await httpClient.delete(
    `/api/admin/diseases/${id}/reject`,
  );
  return data;
};
