import httpClient from "./httpClient";

export const getMyInventoryAIRecipes = async () => {
  const { data } = await httpClient.get("/api/InventoryAiRecipes/my-inventory");
  return data;
};

export const addInventoryAIRecipes = async (payload) => {
  const { data } = await httpClient.post("/api/InventoryAiRecipes/add");
  return data;
};

/** PATCH: update price */
export const updateInventoryAIRecipePrice = async (id, payload) => {
  const { data } = await httpClient.patch(
    `/api/InventoryAiRecipes/${id}/price`,
    payload,
  );
  return data;
};

/** PATCH: update status (e.g. available / unavailable) */
export const updateInventoryAIRecipeStatus = async (id, payload) => {
  const { data } = await httpClient.patch(
    `/api/InventoryAiRecipes/${id}/status`,
    payload,
  );
  return data;
};

export const removeInventoryAIRecipe = async (id) => {
  const { data } = await httpClient.delete(
    `/api/InventoryAiRecipes/${id}/delete`,
  );
  return data;
};

/** GET: herbalists related to this inventory item */
export const getInventoryAIRecipeHerbalists = async (id) => {
  const {data} = await httpClient.get(`/api/InventoryAiRecipes/${id}/herbalists`);
  return data;
};