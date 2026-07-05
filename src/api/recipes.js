import httpClient from "./httpClient";

const RECIPES_LANG_HEADERS = {
  "Accept-Language": "en",
};

export const getAllRecipes = async (
  pageNumber = 1,
  pageSize = 10,
  searchValue = "",
  sortColumn = "",
  sortDirection = "",
) => {
  const { data } = await httpClient.get("/api/Recipes/all", {
    headers: RECIPES_LANG_HEADERS,
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchValue: searchValue,
      SortColumn: sortColumn,
      SortDirection: sortDirection,
    },
  });
  return data;
};

export const getRecipeById = async (id) => {
  const { data } = await httpClient.get(`/api/Recipes/${id}/get-id`, {
    headers: RECIPES_LANG_HEADERS,
  });
  return data;
};

export const getRecipesByHerbalist = async (
  id,
  pageNumber = 1,
  pageSize = 10,
  searchValue = "",
  sortColumn = "",
  sortDirection = "",
  isActive = true,
) => {
  const { data } = await httpClient.get(`/api/Recipes/herbalist/${id}`, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchValue: searchValue,
      SortColumn: sortColumn,
      SortDirection: sortDirection,
      isActive: isActive,
    },
    headers: RECIPES_LANG_HEADERS,
  });
  return data;
};

export const createRecipe = async (payload) => {
  const { data } = await httpClient.post("/api/Recipes/add", payload, {
    headers: RECIPES_LANG_HEADERS,
  });
  return data;
};

export const updateRecipe = async (id, payload) => {
  const { data } = await httpClient.put(`/api/Recipes/${id}/update`, payload, {
    headers: RECIPES_LANG_HEADERS,
  });
  return data;
};

export const toggleRecipeAvailability = async (id) => {
  const { data } = await httpClient.patch(
    `/api/Recipes/${id}/toggle-availability`,
  );
  return data;
};

export const getHerbalistsForRecipe = async (id) => {
  const { data } = await httpClient.get(`/api/Recipes/${id}/herbalists`, {
    headers: RECIPES_LANG_HEADERS,
  });
  return data;
};

export const getRecipeWithHerbalist = async (id) => {
  const { data } = await httpClient.get(`/api/Recipes/${id}/with-herbalist`, {
    headers: RECIPES_LANG_HEADERS,
  });
  return data;
};

export const adminDeleteRecipe = async (id) => {
  const { data } = await httpClient.delete(`/api/admin/delete/${id}`);
  return data;
};
