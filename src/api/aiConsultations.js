// src/api/aiConsultations.js
/**
 * Service layer for AI Consultations module.
 * Provides reusable functions that wrap HTTP requests using the shared httpClient.
 * All functions return the `data` payload directly for convenience.
 */
import httpClient from "./httpClient";

/**
 * Fetch all available consultation types.
 * GET /api/AiConsultations/catalog
 */
export const fetchConsultationCatalog = async (params = {}) => {
  const { data } = await httpClient.get("/api/AiConsultations/catalog", {
    params,
  });
  return data;
};

/**
 * Fetch details of a specific consultation type from the catalog.
 * GET /api/AiConsultations/{id}/catalog
 */
export const fetchCatalogById = async (id) => {
  if (!id) throw new Error("consultation id is required");
  const { data } = await httpClient.get(`/api/AiConsultations/${id}/catalog`);
  return data;
};

/**
 * Fetch the current user's consultation history.
 * GET /api/AiConsultations/myConsultations
 */
export const fetchMyConsultations = async (pageNumber = 1, pageSize = 6) => {
  const { data } = await httpClient.get(
    "/api/AiConsultations/myConsultations",
    {
      params: { pageNumber, pageSize },
    },
  );
  return data;
};

/**
 * Fetch details of a specific personal consultation.
 * GET /api/AiConsultations/{id}/myConsultation
 */
export const fetchMyConsultationById = async (id) => {
  if (!id) throw new Error("consultation id is required");
  const { data } = await httpClient.get(
    `/api/AiConsultations/${id}/myConsultation`,
  );
  return data;
};

/**
 * Generate a new AI consultation.
 * POST /api/AiConsultations/generate
 */
export const generateConsultation = async (payload) => {
  if (!payload)
    throw new Error("payload is required to generate a consultation");
  const { data } = await httpClient.post(
    "/api/AiConsultations/generate",
    payload,
  );
  // Return both confidence score and preparation instructions (if present)
  return {
    confidenceScore: data.confidenceScore,
    preparationInstructions: data.preparationInstructions,
    // Include any other fields for future flexibility
    ...data,
  };
};

/**
 * Fetch AI Consultations statistics for admin overview.
 * GET /api/admin/ai-consultations/statistics
 */
export const getAdminAiConsultationsStatistics = async () => {
  const { data } = await httpClient.get("/api/admin/ai-consultations/statistics");
  return data;
};

export const getAdminAiConsultations = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/ai-consultations", {
    params,
  });
  return data;
};

export const deleteAdminAiConsultation = async (id) => {
  const { data } = await httpClient.delete(
    `/api/admin/ai-consultations/${id}`,
  );
  return data;
};

export const getAllCatalogs = fetchConsultationCatalog;
export const myAllConsultations = fetchMyConsultations;
export const generateAiConsultation = generateConsultation;

// Export as a single object for convenient imports
export default {
  fetchConsultationCatalog,
  fetchCatalogById,
  fetchMyConsultations,
  fetchMyConsultationById,
  generateConsultation,
  getAdminAiConsultationsStatistics,
  getAllCatalogs,
  myAllConsultations,
  generateAiConsultation,
};
