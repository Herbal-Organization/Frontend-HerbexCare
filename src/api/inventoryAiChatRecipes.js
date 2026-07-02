import httpClient from "./httpClient";

/**
 * Get current herbalist inventory of AI Chat recipes.
 * GET /api/inventory-ai-chat-recipes/my-inventory
 */
export const getMyInventoryAiChatRecipes = async () => {
  const { data } = await httpClient.get(
    "/api/inventory-ai-chat-recipes/my-inventory",
  );
  return data;
};

/**
 * Get all AI Chat recipes across all herbalists for admin.
 * GET /api/admin/inventory-ai-chat-recipes
 */
export const getAdminInventoryAiChatRecipes = async (params) => {
  const { data } = await httpClient.get("/api/admin/inventory-ai-chat-recipes", {
    params,
  });
  return data;
};

/**
 * Delete an inventory AI Chat recipe record for a specific herbalist.
 * DELETE /api/admin/inventory-ai-chat-recipes/{herbalistId}/{recipeId}
 */
export const deleteAdminInventoryAiChatRecipe = async (herbalistId, recipeId) => {
  const { data } = await httpClient.delete(
    `/api/admin/inventory-ai-chat-recipes/${herbalistId}/${recipeId}`
  );
  return data;
};

/**
 * Add an AI Chat recipe to inventory with a selling price.
 * POST /api/inventory-ai-chat-recipes/add
 */
export const addInventoryAiChatRecipe = async (aiChatRecipeId, price) => {
  const { data } = await httpClient.post("/api/inventory-ai-chat-recipes/add", {
    aiChatRecipeId: Number(aiChatRecipeId),
    price: Number(price),
  });
  return data;
};

/**
 * Update selling price for an inventory item.
 * PATCH /api/inventory-ai-chat-recipes/{id}/price
 */
export const updateInventoryAiChatRecipePrice = async (inventoryId, price) => {
  const { data } = await httpClient.patch(
    `/api/inventory-ai-chat-recipes/${inventoryId}/price`,
    { price: Number(price) },
  );
  return data;
};

/**
 * Toggle active / inactive status for an inventory item.
 * PATCH /api/inventory-ai-chat-recipes/{id}/status
 */
export const toggleInventoryAiChatRecipeStatus = async (inventoryId) => {
  const { data } = await httpClient.patch(
    `/api/inventory-ai-chat-recipes/${inventoryId}/status`,
  );
  return data;
};

/**
 * Remove an AI Chat recipe from inventory.
 * DELETE /api/inventory-ai-chat-recipes/{id}/delete
 */
export const removeInventoryAiChatRecipe = async (inventoryId) => {
  const { data } = await httpClient.delete(
    `/api/inventory-ai-chat-recipes/${inventoryId}/delete`,
  );
  return data;
};

export const getHerbalistsForAiChatRecipe = async (id, isActive = true) => {
  const { data } = await httpClient.get(
    `/api/inventory-ai-chat-recipes/${id}/herbalists`,
    { params: { isActive } },
  );
  return data;
};

export default {
  getMyInventoryAiChatRecipes,
  getAdminInventoryAiChatRecipes,
  deleteAdminInventoryAiChatRecipe,
  addInventoryAiChatRecipe,
  updateInventoryAiChatRecipePrice,
  toggleInventoryAiChatRecipeStatus,
  removeInventoryAiChatRecipe,
  getHerbalistsForAiChatRecipe,
};
