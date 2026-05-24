const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const safeParseJson = (value) => {
  if (!isNonEmptyString(value)) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toPossibilityLabel = (item) => {
  if (isNonEmptyString(item)) return item.trim();
  if (item && typeof item === "object") {
    return (
      item.recommendedRecipeName ||
      item.recipeName ||
      item.name ||
      item.title ||
      item.label ||
      null
    );
  }
  return null;
};

const formatPreparation = (value) => {
  if (isNonEmptyString(value)) return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((step) => (typeof step === "string" ? step.trim() : String(step)))
      .filter(Boolean)
      .join("\n");
  }
  return "";
};

const pickRecipeObject = (payload) => {
  if (!payload) return null;

  if (typeof payload === "string") {
    const parsed = safeParseJson(payload);
    return parsed ? pickRecipeObject(parsed) : null;
  }

  if (Array.isArray(payload)) {
    return payload.length ? pickRecipeObject(payload[0]) : null;
  }

  if (typeof payload !== "object") return null;

  const nestedCandidates = [
    payload,
    payload.data,
    payload.result,
    payload.recipe,
    payload.generatedRecipe,
    payload.consultation,
    payload.aiChatRecipe,
    payload.item,
    payload.value,
    Array.isArray(payload.items) ? payload.items[0] : null,
  ].filter(Boolean);

  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string") {
      const parsed = safeParseJson(candidate);
      if (parsed) return pickRecipeObject(parsed);
      continue;
    }

    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      continue;
    }

    if (
      candidate.recommendedRecipeName ||
      candidate.mainHerb ||
      candidate.aiChatRecipeId != null ||
      candidate.matchPercentage != null
    ) {
      return candidate;
    }
  }

  return payload;
};

/**
 * Normalize POST /api/AiChat/chat-generate response for UI rendering.
 */
export const normalizeAiChatRecipeResponse = (raw) => {
  const recipe = pickRecipeObject(raw);
  if (!recipe || typeof recipe !== "object") {
    return null;
  }

  const preparation = formatPreparation(
    recipe.preparation ??
      recipe.preparationInstructions ??
      recipe.instructions,
  );

  const otherPossibilities = (
    Array.isArray(recipe.otherPossibilities) ? recipe.otherPossibilities : []
  )
    .map(toPossibilityLabel)
    .filter(Boolean);

  const matchRaw =
    recipe.matchPercentage ??
    recipe.matchPercent ??
    recipe.confidenceScore ??
    recipe.score;

  const matchPercentage =
    matchRaw === null || matchRaw === undefined || matchRaw === ""
      ? undefined
      : Number(matchRaw);

  return {
    ...recipe,
    aiChatRecipeId:
      recipe.aiChatRecipeId ?? recipe.id ?? recipe.recipeId ?? recipe.targetId,
    recommendedRecipeName:
      recipe.recommendedRecipeName ||
      recipe.recipeName ||
      recipe.title ||
      recipe.name,
    mainHerb: recipe.mainHerb || recipe.herbName || recipe.primaryHerb,
    scientificName: recipe.scientificName || recipe.botanicalName,
    category: recipe.category || recipe.recipeCategory,
    preparation,
    dosage: recipe.dosage || recipe.dose,
    contraindications:
      recipe.contraindications ||
      recipe.cautionWarning ||
      recipe.warnings ||
      recipe.precautions,
    matchPercentage: Number.isFinite(matchPercentage) ? matchPercentage : undefined,
    otherPossibilities,
  };
};

export const hasAiChatRecipeDisplayData = (data) => {
  if (!data || typeof data !== "object") return false;

  return Boolean(
    data.recommendedRecipeName ||
      data.mainHerb ||
      data.preparation ||
      data.dosage ||
      data.contraindications ||
      data.aiChatRecipeId != null ||
      data.matchPercentage != null,
  );
};
