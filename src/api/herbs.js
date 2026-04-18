import httpClient from "./httpClient";

export const getAllHerbs = async () => {
  const { data } = await httpClient.get("/api/Herbs/all");
  return data;
};

export const createHerb = async (payload) => {
  const formData = buildHerbFormData(payload);

  const { data } = await httpClient.post("/api/Herbs/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

const buildHerbFormData = (payload) => {
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
  const id = parseInt(herbId, 10);
  console.log(
    "API: Deleting herb with ID:",
    id,
    "Original:",
    herbId,
    "Type:",
    typeof id,
  );
  if (isNaN(id)) {
    throw new Error("Invalid herb ID: must be a number");
  }
  const { data } = await httpClient.delete(`/api/Herbs/${id}/delete`);
  console.log("API: Delete herb response:", data);
  return data;
};

export const getHerbById = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/get-id`);
  return data;
};

export const getHerbWithHerbalist = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/with-herbalist`);
  return data;
};

export const getHerbalistsForHerb = async (herbId) => {
  const { data } = await httpClient.get(`/api/Herbs/${herbId}/herbalists`);
  return data;
};
