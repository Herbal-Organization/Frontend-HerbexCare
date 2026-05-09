import httpClient from "./httpClient";

const HERBS_LANG_HEADERS = {
  "Accept-Language": "en",
};

// /api/Herbs/all?pageNumber=1&pageSize=10&searchValue=&sortColumn=&sortDirection=

// pageNumber => page number i want to get
// pageSize => how many items i want to get in one page
// searchValue => the value i want to search for (by name or scientific name)
// sortColumn => the column i want to sort by (herbName, scientificName, etc.)
// sortDirection => the direction i want to sort (asc or desc)

// examples:
// getAllHerbs(2); // gave me the second page
// getAllHerbs(1, 20); // gave me the first page with 20 items
export const getAllHerbs = async (
  pageNumber = 1,
  pageSize = 10,
  searchValue = "",
  sortColumn = "",
  sortDirection = "",
) => {
  const { data } = await httpClient.get("/api/Herbs/all", {
    headers: HERBS_LANG_HEADERS,
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

export const getHerbById = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/get-id`, {
    headers: HERBS_LANG_HEADERS,
  });
  return data;
};

export const getHerbWithHerbalist = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/with-herbalist`, {
    headers: HERBS_LANG_HEADERS,
  });
  return data;
};

export const createHerb = async (payload) => {
  // use buildHerbFormData because we are sending image
  // JSON don't send images directly , we must use form data

  // formData => for data contains files
  const formData = buildHerbFormData(payload);

  const { data } = await httpClient.post("/api/Herbs/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

const buildHerbFormData = (payload) => {
  // obj built-in for uploading files and images
  const formData = new FormData();

  formData.append("HerbName", payload.herbName);
  formData.append("ScientificName", payload.scientificName);
  formData.append("Description", payload.description);
  formData.append("Benefits", payload.benefits);
  formData.append("Dosage", payload.dosage);
  formData.append("Warnings", payload.warnings);

  if (payload.image) {
    formData.append("Image", payload.image);
  }

  return formData;
};

export const updateHerb = async (herbId, payload) => {
  const formData = buildHerbFormData(payload);

  const { data } = await httpClient.put(
    `/api/Herbs/${herbId}/update`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export const deleteHerb = async (herbId) => {
  // convert string to number because the endpoint expects a number
  // 10 => means base 10
  const id = parseInt(herbId, 10);
  const { data } = await httpClient.delete(`/api/Herbs/${id}/delete`);
  return data;
};

export const getHerbalistsForHerb = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/herbalists`, {
    headers: HERBS_LANG_HEADERS,
  });
  return data;
};
