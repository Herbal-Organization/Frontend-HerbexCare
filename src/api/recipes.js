import httpClient from "./httpClient";

export const getAllRecipes = async () => {
  const { data } = await httpClient.get("/api/Recipes/all");
  return data;
};

export const createRecipe = async (payload) => {
  const { data } = await httpClient.post("/api/Recipes/add", payload);
  return data;
};

export const updateRecipe = async (recipeId, payload) => {
  const { data } = await httpClient.put(
    `/api/Recipes/${recipeId}/update`,
    payload,
  );
  return data;
};

export const deleteRecipe = async (recipeId) => {
  const { data } = await httpClient.delete(`/api/Recipes/${recipeId}/delete`);
  return data;
};

export const getRecipeById = async (recipeId) => {
  const { data } = await httpClient.get(`/api/Recipes/${recipeId}/get-id`);
  return data;
};

export const getRecipeReviews = async (recipeId) => {
  const { data } = await httpClient.get(
    `/api/recipe/${recipeId}/Feedbacks/all`,
  );
  return data;
};

export const getMyRecipeReview = async (recipeId) => {
  const { data } = await httpClient.get(
    `/api/recipe/${recipeId}/Feedbacks/get-me`,
  );
  return data;
};

export const submitRecipeReview = async (recipeId, payload) => {
  const { data } = await httpClient.post(
    `/api/recipe/${recipeId}/Feedbacks/submit`,
    payload,
  );
  return data;
};

export const deleteMyRecipeReview = async (recipeId) => {
  const { data } = await httpClient.delete(
    `/api/recipe/${recipeId}/Feedbacks/delete-me`,
  );
  return data;
};

export const getHerbById = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/get-id`);
  return data;
};
