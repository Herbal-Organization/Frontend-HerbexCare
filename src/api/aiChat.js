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
export const fetchMyChatConsultations = async () => {
  const { data } = await httpClient.get("/api/AiChat/myConsultations");
  return data;
};

/**
 * Fetch a specific chat consultation.
 * GET /api/AiChat/{id}/myConsultation
 */
export const fetchMyChatConsultationById = async (id) => {
  if (!id) throw new Error("consultation id is required");
  const { data } = await httpClient.get(`/api/AiChat/${id}/myConsultation`);
  return data;
};

export default {
  generateChatMessage,
  fetchMyChatConsultations,
  fetchMyChatConsultationById,
};
