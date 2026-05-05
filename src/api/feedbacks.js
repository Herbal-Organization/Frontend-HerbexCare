import httpClient from "./httpClient";

/* =======================
   🔹 Recipe Feedbacks
======================= */

/** GET: all feedbacks for recipe */
export const getRecipeFeedbacks = async (id) => {
  const { data } = await httpClient.get(`/api/Feedbacks/recipe/${id}/all`);
  return data;
};

/** GET: my feedback for recipe */
export const getMyRecipeFeedback = async (id) => {
  const { data } = await httpClient.get(`/api/Feedbacks/recipe/${id}/get-me`);
  return data;
};

/** POST: submit feedback for recipe */
export const submitRecipeFeedback = async (id, payload) => {
  const { data } = await httpClient.post(
    `/api/Feedbacks/recipe/${id}/submit`,
    payload,
  );
  return data;
};

/** DELETE: delete my feedback for recipe */
export const deleteMyRecipeFeedback = async (id) => {
  const { data } = await httpClient.delete(
    `/api/Feedbacks/recipe/${id}/delete-me`,
  );
  return data;
};

/* =======================
   🔹 AI Recipe Feedbacks
======================= */

/** GET: all feedbacks for AI recipe */
export const getAiRecipeFeedbacks = async (id) => {
  const { data } = await httpClient.get(`/api/Feedbacks/ai-recipe/${id}/all`);
  return data;
};

/** GET: my feedback for AI recipe */
export const getMyAiRecipeFeedback = async (id) => {
  const { data } = await httpClient.get(
    `/api/Feedbacks/ai-recipe/${id}/get-me`,
  );
  return data;
};

/** POST: submit feedback for AI recipe */
export const submitAiRecipeFeedback = async (id, payload) => {
  const { data } = await httpClient.post(
    `/api/Feedbacks/ai-recipe/${id}/submit`,
    payload,
  );
  return data;
};

/** DELETE: delete my feedback for AI recipe */
export const deleteMyAiRecipeFeedback = async (id) => {
  const { data } = await httpClient.delete(
    `/api/Feedbacks/ai-recipe/${id}/delete-me`,
  );
  return data;
};

/* =======================
   🔹 My Feedback History
======================= */

/** GET: all my feedback history */
export const getMyFeedbackHistory = async () => {
  const { data } = await httpClient.get("/api/Feedbacks/my-history");
  return data;
};
