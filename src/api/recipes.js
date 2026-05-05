import httpClient from "./httpClient";

export const getAllRecipes = async () => {
  const { data } = await httpClient.get("/api/Recipes/all");
  return data;
};

export const getRecipeById = async (id) => {
  const { data } = await httpClient.get(`/api/Recipes/${id}/get-id`);
  return data;
};

export const getRecipesByHerbalist = async (id) => {
  const { data } = await httpClient.get(`/api/Recipes/herbalist/${id}`);
  return data;
};

export const createRecipe = async (payload) => {
  const { data } = await httpClient.post("/api/Recipes/add", payload);
  return data;
};

export const updateRecipe = async (id, payload) => {
  const { data } = await httpClient.put(`/api/Recipes/${id}/update`, payload);
  return data;
};

export const toggleRecipeAvailability = async (id) => {
  const { data } = await httpClient.patch(
    `/api/Recipes/${id}/toggle-availability`,
  );
  return data;
};
