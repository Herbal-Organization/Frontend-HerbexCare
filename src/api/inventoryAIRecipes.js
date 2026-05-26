import httpClient from "./httpClient";

/**
 * GET /api/inventory-ai-recipes/my-inventory
 */
export const getMyInventoryAIRecipes = async () => {
  const { data } = await httpClient.get(
    "/api/inventory-ai-recipes/my-inventory",
  );
  return data;
};

/**
 * POST /api/inventory-ai-recipes/add
 */
export const addInventoryAIRecipe = async (aiRecipeId, price) => {
  const { data } = await httpClient.post("/api/inventory-ai-recipes/add", {
    aiRecipeId: Number(aiRecipeId),
    price: Number(price),
  });
  return data;
};

/**
 * PATCH /api/inventory-ai-recipes/{id}/price
 */
export const updateInventoryAIRecipePrice = async (inventoryId, price) => {
  const { data } = await httpClient.patch(
    `/api/inventory-ai-recipes/${inventoryId}/price`,
    { price: Number(price) },
  );
  return data;
};

/**
 * Toggle active / inactive status for an inventory item.
 * PATCH /api/inventory-ai-recipes/{id}/status
 */
export const toggleInventoryAIRecipeStatus = async (inventoryId) => {
  const { data } = await httpClient.patch(
    `/api/inventory-ai-recipes/${inventoryId}/status`,
  );
  return data;
};

/**
 * DELETE /api/inventory-ai-recipes/{id}/delete
 */
export const removeInventoryAIRecipe = async (inventoryId) => {
  const { data } = await httpClient.delete(
    `/api/inventory-ai-recipes/${inventoryId}/delete`,
  );
  return data;
};

/** @deprecated Use addInventoryAIRecipe */
export const addInventoryAIRecipes = async (payload) =>
  addInventoryAIRecipe(payload?.aiRecipeId, payload?.price);

export default {
  getMyInventoryAIRecipes,
  addInventoryAIRecipe,
  updateInventoryAIRecipePrice,
  toggleInventoryAIRecipeStatus,
  removeInventoryAIRecipe,
  addInventoryAIRecipes,
};
