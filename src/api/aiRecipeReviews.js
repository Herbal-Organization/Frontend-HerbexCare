import httpClient from "./httpClient";

const basePath = (id) => `/api/ai-recipe/${id}/reviews`;

/**
 * GET /api/ai-recipe/{id}/reviews/all
 */
export const getAllAiRecipeReviews = async (id) => {
  if (!id) throw new Error("AI recipe ID is required");
  const { data } = await httpClient.get(`${basePath(id)}/all`);
  return data;
};

/**
 * GET /api/ai-recipe/{id}/reviews/get-me
 */
export const getMyAiRecipeReview = async (id) => {
  if (!id) throw new Error("AI recipe ID is required");
  const { data } = await httpClient.get(`${basePath(id)}/get-me`);
  return data;
};

/**
 * POST /api/ai-recipe/{id}/reviews/submit
 * @param {{ ratingValue: number, comment?: string }} payload
 */
export const submitAiRecipeReview = async (id, payload) => {
  if (!id) throw new Error("AI recipe ID is required");
  const { data } = await httpClient.post(`${basePath(id)}/submit`, {
    ratingValue: Number(payload?.ratingValue ?? 0),
    comment: payload?.comment ?? "",
  });
  return data;
};

/**
 * DELETE /api/ai-recipe/{id}/reviews/delete-me
 */
export const deleteMyAiRecipeReview = async (id) => {
  if (!id) throw new Error("AI recipe ID is required");
  const { data } = await httpClient.delete(`${basePath(id)}/delete-me`);
  return data;
};

export default {
  getAllAiRecipeReviews,
  getMyAiRecipeReview,
  submitAiRecipeReview,
  deleteMyAiRecipeReview,
};
