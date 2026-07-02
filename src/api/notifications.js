import httpClient from "./httpClient";

export const getMyNotifications = async (isRead) => {
  const params = {};
  if (isRead !== undefined) params.isRead = isRead;
  const { data } = await httpClient.get("/api/Notifications/my-notifications", {
    params,
  });
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await httpClient.patch(
    `/api/Notifications/${id}/mark-as-read`,
  );
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await httpClient.patch(
    "/api/Notifications/mark-all-as-read",
  );
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await httpClient.delete(
    `/api/Notifications/${id}/delete`,
  );
  return data;
};

export const sendBulkNotification = async (payload) => {
  const { data } = await httpClient.post(
    "/api/admin/notifications/send-bulk",
    payload,
  );
  return data;
};
