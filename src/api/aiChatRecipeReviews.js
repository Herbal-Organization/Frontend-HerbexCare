import httpClient from "./httpClient";

const basePath = (id) => `/api/ai-chat-recipe/${id}/reviews`;

/**
 * GET /api/ai-chat-recipe/{id}/reviews/all
 */
export const getAllAiChatRecipeReviews = async (id) => {
  if (!id) throw new Error("AI chat recipe ID is required");
  const { data } = await httpClient.get(`${basePath(id)}/all`);
  return data;
};

/**
 * GET /api/ai-chat-recipe/{id}/reviews/get-me
 */
export const getMyAiChatRecipeReview = async (id) => {
  if (!id) throw new Error("AI chat recipe ID is required");
  const { data } = await httpClient.get(`${basePath(id)}/get-me`);
  return data;
};

/**
 * POST /api/ai-chat-recipe/{id}/reviews/submit
 * @param {{ ratingValue: number, comment?: string }} payload
 */
export const submitAiChatRecipeReview = async (id, payload) => {
  if (!id) throw new Error("AI chat recipe ID is required");
  const { data } = await httpClient.post(`${basePath(id)}/submit`, {
    ratingValue: Number(payload?.ratingValue ?? 0),
    comment: payload?.comment ?? "",
  });
  return data;
};

/**
 * DELETE /api/ai-chat-recipe/{id}/reviews/delete-me
 */
export const deleteMyAiChatRecipeReview = async (id) => {
  if (!id) throw new Error("AI chat recipe ID is required");
  const { data } = await httpClient.delete(`${basePath(id)}/delete-me`);
  return data;
};

export default {
  getAllAiChatRecipeReviews,
  getMyAiChatRecipeReview,
  submitAiChatRecipeReview,
  deleteMyAiChatRecipeReview,
};
