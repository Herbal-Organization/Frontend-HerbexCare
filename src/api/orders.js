import httpClient from "./httpClient";

export const getMyOrders = async () => {
  const { data } = await httpClient.get("/api/Orders/all-my-orders");
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await httpClient.get(`/api/Orders/${orderId}/get-id`);
  return data;
};

export const createOrder = async (orderPayload) => {
  const { data } = await httpClient.post("/api/Orders/create", orderPayload);
  return data;
};

export const cancelOrder = async (orderId) => {
  const { data } = await httpClient.put(`/api/Orders/${orderId}/cancel`);
  return data;
};

export const simulatePayment = async (orderId) => {
  const { data } = await httpClient.put(
    `/api/Orders/${orderId}/simulate-payment`,
  );
  return data;
};

export const markOrderAsFavorite = async (orderId) => {
  const { data } = await httpClient.patch(`/api/Orders/${orderId}/favorite`);
  return data;
};

export const getFavoriteOrders = async () => {
  const { data } = await httpClient.get("/api/Orders/favorites");
  return data;
};
