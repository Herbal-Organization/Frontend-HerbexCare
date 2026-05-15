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

export default {
  generateChatMessage,
};
