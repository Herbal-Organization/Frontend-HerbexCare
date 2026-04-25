import httpClient from "./httpClient";

export const generateAiConsultation = async (payload) => {
  const { data } = await httpClient.post(
    "/api/AiConsultations/generate",
    payload,
  );
  return data;
};
