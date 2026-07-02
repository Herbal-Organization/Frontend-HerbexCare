import httpClient from "./httpClient";

export const getMyInventoryRecipes = async (params = {}) => {
  const { data } = await httpClient.get(
    "/api/inventory-recipes/my-inventory",
    { params },
  );
  return data;
};

export const addInventoryRecipe = async (recipeId, price) => {
  const { data } = await httpClient.post("/api/inventory-recipes/add", {
    recipeId,
    price,
  });
  return data;
};

export const updateInventoryRecipePrice = async (inventoryId, price) => {
  const { data } = await httpClient.patch(
    `/api/inventory-recipes/${inventoryId}/price`,
    { price },
  );
  return data;
};

export const toggleInventoryRecipeStatus = async (inventoryId) => {
  const { data } = await httpClient.patch(
    `/api/inventory-recipes/${inventoryId}/status`,
  );
  return data;
};

export const deleteInventoryRecipe = async (inventoryId) => {
  const { data } = await httpClient.delete(
    `/api/inventory-recipes/${inventoryId}/delete`,
  );
  return data;
};

export const getHerbalistsForInventoryRecipe = async (
  id,
  isActive = true,
) => {
  const { data } = await httpClient.get(
    `/api/inventory-recipes/${id}/herbalists`,
    { params: { isActive } },
  );
  return data;
};

export const getAdminInventoryRecipes = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/inventory-recipes", {
    params,
  });
  return data;
};

export const deleteAdminInventoryRecipe = async (herbalistId, recipeId) => {
  const { data } = await httpClient.delete(
    `/api/admin/inventory-recipes/${herbalistId}/${recipeId}`,
  );
  return data;
};
