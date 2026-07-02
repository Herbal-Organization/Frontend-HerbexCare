import httpClient from "./httpClient";

export const getAllMyOrders = async (params = {}) => {
  const { pageNumber, pageSize, searchValue, sortColumn, sortDirection } =
    params;

  const queryParams = {};

  if (pageNumber != null) queryParams.PageNumber = pageNumber;
  if (pageSize != null) queryParams.PageSize = pageSize;
  if (searchValue) queryParams.SearchValue = searchValue;
  if (sortColumn) queryParams.SortColumn = sortColumn;
  if (sortDirection) queryParams.SortDirection = sortDirection;

  const { data } = await httpClient.get("/api/Orders/all-my-orders", {
    params: queryParams,
  });
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await httpClient.get(`/api/Orders/${orderId}/get-id`);
  return data;
};

// Fetch complete order with items - if items are missing, try to get them
export const getOrderByIdWithItems = async (orderId) => {
  try {
    const order = await getOrderById(orderId);

    // If order has no items but has a totalCost, log it for debugging
    const hasItems =
      (Array.isArray(order.herbs) && order.herbs.length > 0) ||
      (Array.isArray(order.recipes) && order.recipes.length > 0) ||
      (Array.isArray(order.aiRecipes) && order.aiRecipes.length > 0) ||
      (Array.isArray(order.subOrders) && order.subOrders.length > 0);

    if (!hasItems && order.totalCost > 0) {
      console.warn(
        `[OrderAPI] Order ${orderId} has no items but has totalCost: ${order.totalCost}. This may be a data loading issue.`,
      );
    }

    return order;
  } catch (err) {
    console.error(`[OrderAPI] Failed to fetch order ${orderId}:`, err);
    throw err;
  }
};

export const createOrder = async (orderPayload) => {
  const { data } = await httpClient.post("/api/Orders/create", orderPayload);
  return data;
};

export const cancelOrder = async (orderId) => {
  const { data } = await httpClient.put(`/api/Orders/${orderId}/cancel`);
  return data;
};

export const simulatePayment = async (orderId, payload) => {
  const { data } = await httpClient.put(
    `/api/Orders/${orderId}/simulate-payment`,
    payload,
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

// NOTE: no matching route in swagger.json — returns 404 until the backend
// exposes an admin pending-unapproved orders endpoint.
export const getPendingUnapprovedOrders = async (params = {}) => {
  const { data } = await httpClient.get("/api/Orders/pending-unapproved", {
    params,
  });
  return data;
};

// NOTE: no matching route in swagger.json — returns 404 until the backend
// exposes an admin all-orders endpoint.
export const getAdminAllOrders = async (params = {}) => {
  const { data } = await httpClient.get("/api/Orders/admin/all-orders", {
    params,
  });
  return data;
};
