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
 * Get all consultations for the current user.
 * GET /api/AiChat/myConsultations
 *
 * @returns {Promise<Array>} A list of consultations.
 */
export const getMyConsultations = async () => {
  const { data } = await httpClient.get("/api/AiChat/myConsultations");
  return data;
};

/**
 * Get a specific consultation by its ID.
 * GET /api/AiChat/{id}/myConsultation
 *
 * @param {string} id - The ID of the consultation.
 * @returns {Promise<Object>} The consultation data.
 */
export const getMyConsultationById = async (id) => {
  if (!id) {
    throw new Error("Consultation ID is required.");
  }
  const { data } = await httpClient.get(`/api/AiChat/${id}/myConsultation`);
  return data;
};

export default {
  generateChatMessage,
  getMyConsultations,
  getMyConsultationById,
};
