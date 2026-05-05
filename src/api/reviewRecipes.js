import httpClient from "./httpClient";

// get my review on a specific ai recipe
export const getMyReviewAIRecipe = async (id) => {
  const { data } = await httpClient.get(`/api/ai-recipe/${id}/reviews/get-me`);
  return data;
};

// get all review on a specific ai recipe
export const getAllReviewAIRecipe = async (id) => {
  const { data } = await httpClient.get(`/api/ai-recipe/${id}/reviews/all`);
  return data;
};

export const addReviewAIRecipe = async (id) => {
  const { data } = await httpClient.post(
    `/api/ai-recipe/${id}/reviews/submit`,
    payload,
  );
  return data;
};

export const deleteReviewAIRecipe = async (id) => {
  const { data } = await httpClient.delete(
    `/api/ai-recipe/${id}/reviews/delete-me`,
  );
  return data;
};
