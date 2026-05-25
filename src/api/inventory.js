import httpClient from "./httpClient";

export const getMyInventoryHerbs = async () => {
  const { data } = await httpClient.get("/api/inventory-herbs/my-inventory");
  return data;
};

export const addInventoryHerb = async (payload) => {
  const { data } = await httpClient.post("/api/inventory-herbs/add", payload);
  return data;
};

export const updateInventoryHerbById = async (inventoryId, payload) => {
  const { data } = await httpClient.put(
    `/api/inventory-herbs/${inventoryId}/update`,
    payload,
  );
  return data;
};

export const deleteInventoryHerbById = async (inventoryId) => {
  const { data } = await httpClient.delete(
    `/api/inventory-herbs/${inventoryId}/delete`,
  );
  return data;
};

export const getMyInventory = async () => {
  // { data } => response.data =
  const { data } = await httpClient.get("/api/Inventory/me");
  return data;
};

export const getInventoryById = async (inventoryId) => {
  const { data } = await httpClient.get(`/api/Inventory/${inventoryId}/get-id`);
  return data;
};

export const addHerbToInventory = async (payload) => {
  const { data } = await httpClient.post("/api/Inventory/add", payload);
  return data;
};

export const updateInventoryHerb = async (herbId, payload) => {
  const { data } = await httpClient.put(
    `/api/Inventory/${herbId}/update`,
    payload,
  );
  return data;
};

export const deleteInventoryHerb = async (herbId) => {
  const { data } = await httpClient.delete(`/api/Inventory/${herbId}/delete`);
  return data;
};
