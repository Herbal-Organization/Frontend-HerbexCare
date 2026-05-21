import httpClient from "./httpClient";

/**
 * Get current inventory of AI Chat Recipes.
 * Assumed endpoint: GET /api/inventory-ai-chat-recipes/my-inventory
 */
export const getMyInventoryAiChatRecipes = async () => {
  const { data } = await httpClient.get("/api/inventory-ai-chat-recipes/my-inventory");
  return data;
};

/**
 * Add an AI Chat Recipe to the inventory.
 * POST /api/inventory-ai-chat-recipes/{id}/price
 */
export const addInventoryAiChatRecipe = async (id, price) => {
  const { data } = await httpClient.post(
    `/api/inventory-ai-chat-recipes/${id}/price`,
    { price }
  );
  return data;
};

/**
 * Update the price of an AI Chat Recipe in the inventory.
 * PATCH /api/inventory-ai-chat-recipes/{id}/price
 */
export const updateInventoryAiChatRecipePrice = async (id, price) => {
  const { data } = await httpClient.patch(
    `/api/inventory-ai-chat-recipes/${id}/price`,
    { price }
  );
  return data;
};

/**
 * Remove an AI Chat Recipe from the inventory.
 * Assumed endpoint: DELETE /api/inventory-ai-chat-recipes/{id}/delete
 */
export const removeInventoryAiChatRecipe = async (id) => {
  const { data } = await httpClient.delete(
    `/api/inventory-ai-chat-recipes/${id}/delete`
  );
  return data;
};

export default {
  getMyInventoryAiChatRecipes,
  addInventoryAiChatRecipe,
  updateInventoryAiChatRecipePrice,
  removeInventoryAiChatRecipe,
};
