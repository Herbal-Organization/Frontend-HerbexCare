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
  const proposalPayload = {
    diseaseName: String(payload?.diseaseName || "").trim(),
    diseaseType: String(payload?.diseaseType || "").trim(),
    description: String(payload?.description || "").trim(),
    symptoms: String(payload?.symptoms || "").trim(),
    isSupportedByAi:
      payload?.isSupportedByAi === true ||
      payload?.isSupportedByAi === "true" ||
      payload?.isSupportedByAi === "True" ||
      payload?.isSupportedByAi === 1,
  };

  const { data } = await httpClient.post(
    "/api/Diseases/propose",
    proposalPayload,
  );
  return data?.data ?? data;
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
  const { data } = await httpClient.patch(`/api/admin/diseases/${id}/approve`);
  return data;
};

export const rejectDisease = async (id) => {
  const { data } = await httpClient.delete(`/api/admin/diseases/${id}/reject`);
  return data;
};
