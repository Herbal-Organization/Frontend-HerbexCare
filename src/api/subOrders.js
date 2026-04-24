import httpClient from "./httpClient";

export const getMySubOrders = async () => {
  const { data } = await httpClient.get("/api/SubOrders/my-tasks");
  return data;
};

export const getSubOrderById = async (id) => {
  const { data } = await httpClient.get(`/api/SubOrders/${id}`);
  return data;
};

export const updateSubOrderStatus = async (id, status) => {
  const { data } = await httpClient.put(`/api/SubOrders/${id}/status`, {
    status,
  });
  return data;
};
