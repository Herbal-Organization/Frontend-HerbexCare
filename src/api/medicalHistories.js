import httpClient from "./httpClient";

const MEDICAL_LANG_HEADERS = {
  "Accept-Language": "en",
};

export const getMyMedicalHistory = async () => {
  const { data } = await httpClient.get("/api/MedicalHistories/me", {
    headers: MEDICAL_LANG_HEADERS,
  });
  return data;
};

export const saveMyMedicalHistory = async (payload) => {
  const { data } = await httpClient.post("/api/MedicalHistories/me", payload, {
    headers: MEDICAL_LANG_HEADERS,
  });
  return data;
};

// GET: patient medical history by id
export const getPatientMedicalHistory = async (id) => {
  const { data } = await httpClient.get(`/api/MedicalHistories/patient/${id}`, {
    headers: MEDICAL_LANG_HEADERS,
  });
  return data;
};

export const deleteAdminPatientMedicalHistory = async (patientId) => {
  const { data } = await httpClient.delete(
    `/api/admin/medical-histories/patient/${patientId}`,
  );
  return data;
};
