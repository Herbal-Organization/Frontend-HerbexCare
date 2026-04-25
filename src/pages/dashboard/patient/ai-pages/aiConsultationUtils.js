export const parseSymptoms = (value) => {
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
};

export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseApiError = (error) => {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === "object") {
    const firstGroup = Object.values(responseData.errors)[0];
    if (Array.isArray(firstGroup) && firstGroup.length) {
      return firstGroup[0];
    }
  }

  return (
    responseData?.message ||
    responseData?.title ||
    "Failed to generate AI consultation. Please try again."
  );
};
