import httpClient from "./httpClient";

/**
 * GET /api/Herbalists/get-profile/me
 */
export const getMyHerbalistProfile = async () => {
  const { data } = await httpClient.get("/api/Herbalists/get-profile/me");
  return data;
};

export const getHerbalistById = async (id) => {
  const { data } = await httpClient.get(`/api/Herbalists/get-by-id/${id}`);
  return data;
};

export const getAllHerbalists = async () => {
  const { data } = await httpClient.get("/api/Herbalists/get-all");
  return data;
};

/**
 * PUT /api/Herbalists/update-profile/me
 * Body: { bio, availableFrom, availableTo } — times as "HH:mm"
 */
export const updateMyHerbalistProfile = async (payload) => {
  const { data } = await httpClient.put(
    "/api/Herbalists/update-profile/me",
    payload,
  );
  return data;
};

export const deleteMyHerbalistAccount = async (userId) => {
  const { data } = await httpClient.delete(`/api/Users/delete/${userId}`);
  return data;
};

export const resetMyHerbalistAccount = async (payload) => {
  const { data } = await httpClient.post(
    "/api/Accounts/reset-password",
    payload,
  );
  return data;
};
