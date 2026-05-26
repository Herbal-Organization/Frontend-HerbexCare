import httpClient from "./httpClient";

const basePath = (id) => `/api/Feedbacks/ai-chat-recipe/${id}`;

/**
 * GET /api/Feedbacks/ai-chat-recipe/{id}/all
 */
export const getAllAiChatRecipeReviews = async (id) => {
  if (!id) throw new Error("AI chat recipe ID is required");
  const { data } = await httpClient.get(`${basePath(id)}/all`);
  return data;
};

/**
 * GET /api/Feedbacks/ai-chat-recipe/{id}/get-me
 */
export const getMyAiChatRecipeReview = async (id) => {
  if (!id) throw new Error("AI chat recipe ID is required");
  const { data } = await httpClient.get(`${basePath(id)}/get-me`);
  return data;
};

/**
 * POST /api/Feedbacks/ai-chat-recipe/{id}/submit
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
 * DELETE /api/Feedbacks/ai-chat-recipe/{id}/delete-me
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
