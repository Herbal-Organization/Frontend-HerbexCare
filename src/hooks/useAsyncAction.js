import { useCallback, useState } from "react";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const getErrorMessage = (error, fallbackMessage = DEFAULT_ERROR_MESSAGE) => {
  if (!error) {
    return fallbackMessage;
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.title) {
    return responseData.title;
  }

  return fallbackMessage;
};

function useAsyncAction(action, options = {}) {
  const { onSuccess, onError, defaultErrorMessage = DEFAULT_ERROR_MESSAGE } =
    options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError("");

      try {
        const result = await action(...args);
        onSuccess?.(result, ...args);
        return result;
      } catch (err) {
        const message = getErrorMessage(err, defaultErrorMessage);
        setError(message);
        onError?.(err, message, ...args);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [action, defaultErrorMessage, onError, onSuccess],
  );

  return {
    error,
    isLoading,
    execute,
    clearError: () => setError(""),
  };
}

export default useAsyncAction;
