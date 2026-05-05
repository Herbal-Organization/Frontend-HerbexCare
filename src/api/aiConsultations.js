import httpClient from "./httpClient";

export const getAllCatalogs = async () => {
  const { data } = await httpClient.get("/api/AiConsultations/catalog");
  return data;
};

export const getCatalogById = async (id) => {
  const { data } = await httpClient.get(`/api/AiConsultations/${id}/catalog`);
  return data;
};

export const myAllConsultations = async () => {
  const { data } = await httpClient.get("/api/AiConsultations/myConsultations");

  return data;
};

export const getMyConsultationById = async (id) => {
  const { data } = await httpClient.get(
    `/api/AiConsultations/${id}/myConsultation`,
  );

  return data;
};

export const generateAiConsultation = async (payload) => {
  const { data } = await httpClient.post(
    "/api/AiConsultations/generate",
    payload,
  );
  return data;
};
