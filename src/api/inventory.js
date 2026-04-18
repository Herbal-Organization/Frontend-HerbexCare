import httpClient from "./httpClient";

export const getMyInventory = async () => {
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
