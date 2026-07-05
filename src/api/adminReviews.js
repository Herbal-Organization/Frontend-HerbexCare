import httpClient from "./httpClient";

export const getAdminAiRecipeReviews = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/ai-recipe-reviews", {
    params,
  });
  return data;
};

export const deleteAdminAiRecipeReview = async (reviewId) => {
  const { data } = await httpClient.delete(
    `/api/admin/ai-recipe-reviews/${reviewId}`,
  );
  return data;
};

export const getAdminAiChatRecipeReviews = async (params = {}) => {
  const { data } = await httpClient.get(
    "/api/admin/ai-chat-recipe-reviews",
    { params },
  );
  return data;
};

export const deleteAdminAiChatRecipeReview = async (reviewId) => {
  const { data } = await httpClient.delete(
    `/api/admin/ai-chat-recipe-reviews/${reviewId}`,
  );
  return data;
};
