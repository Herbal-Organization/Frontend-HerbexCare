import httpClient from "./httpClient";

export const getMySubOrders = async () => {
  const { data } = await httpClient.get("/api/SubOrders/my-tasks");
  return data;
};

export const getSubOrderById = async (id) => {
  const { data } = await httpClient.get(`/api/SubOrders/${id}`);
  return data;
};

export const updateSubOrderStatus = async (id, payload) => {
  const { data } = await httpClient.put(`/api/SubOrders/${id}/status`, payload);
  return data;
};

export const getMyFinancials = async () => {
  const { data } = await httpClient.get("/api/SubOrders/my-financials");
  return data;
};

export const cancelSubOrder = async (subOrderId) => {
  const { data } = await httpClient.put(
    `/api/SubOrders/sub-orders/${subOrderId}/cancel`,
  );
  return data;
};
