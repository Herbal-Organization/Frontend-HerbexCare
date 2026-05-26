import httpClient from "./httpClient";

// Recipe feedbacks
export const getRecipeFeedbacks = async (id) => {
  const { data } = await httpClient.get(`/api/Feedbacks/recipe/${id}/all`);
  return data;
};

export const getMyRecipeFeedback = async (id) => {
  const { data } = await httpClient.get(`/api/Feedbacks/recipe/${id}/get-me`);
  return data;
};

export const submitRecipeFeedback = async (id, payload) => {
  const { data } = await httpClient.post(
    `/api/Feedbacks/recipe/${id}/submit`,
    payload,
  );
  return data;
};

export const deleteMyRecipeFeedback = async (id) => {
  const { data } = await httpClient.delete(
    `/api/Feedbacks/recipe/${id}/delete-me`,
  );
  return data;
};

// AI Recipe feedbacks

export const getAiRecipeFeedbacks = async (id) => {
  const { data } = await httpClient.get(`/api/Feedbacks/ai-recipe/${id}/all`);
  return data;
};

export const getMyAiRecipeFeedback = async (id) => {
  const { data } = await httpClient.get(
    `/api/Feedbacks/ai-recipe/${id}/get-me`,
  );
  return data;
};

export const submitAiRecipeFeedback = async (id, payload) => {
  const { data } = await httpClient.post(
    `/api/Feedbacks/ai-recipe/${id}/submit`,
    payload,
  );
  return data;
};

export const deleteMyAiRecipeFeedback = async (id) => {
  const { data } = await httpClient.delete(
    `/api/Feedbacks/ai-recipe/${id}/delete-me`,
  );
  return data;
};

// My feedback history
export const getMyFeedbackHistory = async (pageNumber = 1, pageSize = 10) => {
  const { data } = await httpClient.get("/api/Feedbacks/my-history", {
    params: { pageNumber, pageSize },
  });
  return data;
};
