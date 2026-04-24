import httpClient from "./httpClient";

export const getMyHerbalistProfile = async () => {
  const { data } = await httpClient.get("/api/Herbalists/get-profile/me");
  return data;
};

export const updateMyHerbalistProfile = async (payload) => {
  const { data } = await httpClient.put(
    "/api/Herbalists/update-profile/me",
    payload,
  );
  return data;
};

export const getHerbalistById = async (id) => {
  const { data } = await httpClient.get(`/api/Herbalists/get-by-id/${id}`);
  return data;
};
