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

// AI Chat Recipe feedbacks
export const getAiChatRecipeFeedbacks = async (id) => {
  const { data } = await httpClient.get(
    `/api/Feedbacks/ai-chat-recipe/${id}/all`,
  );
  return data;
};

export const getMyAiChatRecipeFeedback = async (id) => {
  const { data } = await httpClient.get(
    `/api/Feedbacks/ai-chat-recipe/${id}/get-me`,
  );
  return data;
};

export const submitAiChatRecipeFeedback = async (id, payload) => {
  const { data } = await httpClient.post(
    `/api/Feedbacks/ai-chat-recipe/${id}/submit`,
    payload,
  );
  return data;
};

export const deleteMyAiChatRecipeFeedback = async (id) => {
  const { data } = await httpClient.delete(
    `/api/Feedbacks/ai-chat-recipe/${id}/delete-me`,
  );
  return data;
};

// Admin feedbacks
export const getAdminFeedbacks = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/feedbacks", { params });
  return data;
};

export const deleteAdminFeedback = async (id) => {
  const { data } = await httpClient.delete(`/api/admin/feedbacks/${id}`);
  return data;
};
