import httpClient from "./httpClient";

/**
 * Generate an AI Chat response.
 * POST /api/AiChat/chat-generate
 *
 * @param {Object} payload - The chat request payload. Expected format: { userPrompt: string }
 * @returns {Promise<Object>} The AI chat response data.
 */
export const generateChatMessage = async (payload) => {
  if (!payload || !payload.userPrompt) {
    throw new Error("Payload with userPrompt is required.");
  }
  const { data } = await httpClient.post("/api/AiChat/chat-generate", payload);
  return data;
};

/**
 * Fetch the current user's chat consultations.
 * GET /api/AiChat/myConsultations
 */
export const fetchMyChatConsultations = async (pageNumber = 1, pageSize = 10) => {
  const { data } = await httpClient.get("/api/AiChat/myConsultations", {
    params: { pageNumber, pageSize },
  });
  return data;
};

// Backwards-compatible aliases (some files import the older names)
export const fetchMyAiChatConsultations = fetchMyChatConsultations;

/**
 * Fetch details of a specific AI Chat consultation.
 * GET /api/AiChat/{id}/myConsultation
 */
export const fetchMyChatConsultationById = async (id) => {
  if (!id) throw new Error("Consultation ID is required");
  const { data } = await httpClient.get(`/api/AiChat/${id}/myConsultation`);
  return data;
};

// Backwards-compatible alias
export const fetchMyAiChatConsultationById = fetchMyChatConsultationById;

/**
 * Fetch the AI Chat catalog.
 * GET /api/AiChat/catalog
 */
export const fetchAiChatCatalog = async (pageNumber = 1, pageSize = 1000) => {
  const { data } = await httpClient.get("/api/AiChat/catalog", {
    params: { pageNumber, pageSize },
  });
  return data;
};

/**
 * Fetch details of a specific AI Chat catalog item.
 * GET /api/AiChat/{id}/catalog
 */
export const fetchAiChatCatalogById = async (id) => {
  if (!id) throw new Error("Catalog ID is required");
  const { data } = await httpClient.get(`/api/AiChat/${id}/catalog`);
  return data;
};

export default {
  generateChatMessage,
  fetchMyChatConsultations,
  fetchMyChatConsultationById,
  fetchAiChatCatalog,
  fetchAiChatCatalogById,
};
