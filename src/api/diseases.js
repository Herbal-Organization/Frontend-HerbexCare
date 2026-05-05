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
  const { data } = await httpClient.post("/api/Diseases/add", payload);
  return data;
};
