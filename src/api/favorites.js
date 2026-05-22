import httpsClient from "./httpClient";

export const getMyHerbsFavorites = async () => {
  const { data } = await httpsClient.get("/api/Favorites/my-herbs");
  return data;
};

export const getMyRecipesFavorites = async () => {
  const { data } = await httpsClient.get("/api/Favorites/my-recipes");
  return data;
};

export const getMyAIRecipesFavorites = async () => {
  const { data } = await httpsClient.get("/api/Favorites/my-ai-recipes");
  return data;
};

export const getMyAiChatRecipesFavorites = async () => {
  const { data } = await httpsClient.get("/api/Favorites/my-ai-chat-recipes");
  return data;
};

export const getMyHerbalistsFavorites = async (params = {}) => {
  const { data } = await httpsClient.get("/api/Favorites/my-herbalists", {
    params,
  });
  return data;
};

// toggle favorite
export const toggleFavorite = async (payload) => {
  const { data } = await httpsClient.post("/api/Favorites/toggle", payload);
  return data;
};
