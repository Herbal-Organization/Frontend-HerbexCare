import httpClient from "./httpClient";
import {
  SUB_ORDER_ACCEPT,
  SUB_ORDER_REJECT,
} from "@features/herbalist/constants/subOrderStatus";

export const getMySubOrders = async (params = {}) => {
  const { data } = await httpClient.get("/api/SubOrders/my-tasks", { params });
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

export const approveSubOrder = async (id) =>
  updateSubOrderStatus(id, SUB_ORDER_ACCEPT);

export const rejectSubOrder = async (id) =>
  updateSubOrderStatus(id, SUB_ORDER_REJECT);

export const getMyFinancials = async () => {
  const { data } = await httpClient.get("/api/SubOrders/my-financials");
  return data;
};

// NOTE: no matching route in swagger.json — returns 404 until the backend
// exposes an admin sub-orders endpoint.
export const getAdminSubOrders = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/sub-orders", { params });
  return data;
};

// NOTE: no matching route in swagger.json — returns 404 until the backend
// exposes an admin sub-order statistics endpoint.
export const getAdminSubOrderStatistics = async () => {
  const { data } = await httpClient.get("/api/admin/sub-orders/statistics");
  return data;
};
