import i18n from "@i18n/config";
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

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const pickFirst = (...values) => {
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value;
    if (isNonEmptyString(value)) return value.trim();
    if (value && typeof value === "object" && Object.keys(value).length) {
      return value;
    }
  }
  return null;
};

const safeParseJson = (value) => {
  if (!isNonEmptyString(value)) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toIngredientText = (ingredient) => {
  if (isNonEmptyString(ingredient)) {
    return ingredient.trim();
  }

  if (ingredient && typeof ingredient === "object") {
    const name = pickFirst(
      ingredient.name,
      ingredient.herbName,
      ingredient.ingredient,
      ingredient.item,
      ingredient.title,
    );
    const quantity = pickFirst(
      ingredient.quantity,
      ingredient.amount,
      ingredient.dose,
      ingredient.value,
    );
    const unit = pickFirst(ingredient.unit, ingredient.measurement);

    if (name && quantity && unit) return `${name}: ${quantity} ${unit}`;
    if (name && quantity) return `${name}: ${quantity}`;
    if (name) return name;

    return Object.entries(ingredient)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
  }

  return null;
};

const normalizeIngredients = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(toIngredientText).filter(Boolean);
  }

  if (isNonEmptyString(value)) {
    return value
      .split(/\n|;|,(?=\s*[A-Za-z])/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, itemValue]) => `${key}: ${itemValue}`)
      .filter(Boolean);
  }

  return [];
};

const normalizeInstructions = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((step) => (typeof step === "string" ? step.trim() : String(step)))
      .filter(Boolean)
      .map((step) => step.replace(/^\d+[.)]\s*/, ""));
  }

  if (isNonEmptyString(value)) {
    const cleaned = value.trim();

    const lines = cleaned
      .split(/\r?\n+/)
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);

    if (lines.length > 1) {
      return lines.map((line) => line.replace(/^\d+[.)]\s*/, ""));
    }

    const numbered = cleaned
      .split(/\s(?=\d+[.)]\s)/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (numbered.length > 1) {
      return numbered.map((line) => line.replace(/^\d+[.)]\s*/, ""));
    }

    return [cleaned.replace(/^\d+[.)]\s*/, "")];
  }

  return [];
};

const extractSection = (text, headingPattern) => {
  if (!isNonEmptyString(text)) return "";

  const escaped = headingPattern.source;
  const regex = new RegExp(
    `${escaped}\s*[:\-]?\s*([\\s\\S]*?)(?=\\n\\s*(?:[#*\\-]?\\s*[A-Za-z][A-Za-z\\s]{2,30}[:\\-])|$)`,
    "i",
  );
  const match = text.match(regex);
  return match?.[1]?.trim() || "";
};

export const normalizeGeneratedRecipe = (result) => {
  const root =
    typeof result === "string"
      ? safeParseJson(result) || { rawContent: result }
      : result || {};

  const nested = [
    root,
    root.data,
    root.result,
    root.recipe,
    root.generatedRecipe,
    root.consultation,
    Array.isArray(root.items) ? root.items[0] : null,
  ]
    .map((item) =>
      typeof item === "string"
        ? safeParseJson(item) || { rawContent: item }
        : item,
    )
    .filter(Boolean);

  const merged = nested.reduce((acc, current) => ({ ...acc, ...current }), {});

  const rawText = pickFirst(
    merged.rawContent,
    merged.responseText,
    merged.content,
    merged.recipeText,
    typeof result === "string" ? result : null,
  );

  const extractedIngredients = extractSection(rawText, /ingredients?/i);
  const extractedPreparation = extractSection(
    rawText,
    /preparation\s+instructions?|instructions?|directions?|method/i,
  );

  const ingredients = normalizeIngredients(
    pickFirst(
      merged.ingredients,
      merged.ingredientList,
      merged.components,
      merged.herbs,
      merged.recipeIngredients,
      extractedIngredients,
    ),
  );

  const preparationInstructions = normalizeInstructions(
    pickFirst(
      merged.preparationInstructions,
      merged.instructions,
      merged.preparation,
      merged.method,
      merged.directions,
      merged.steps,
      root.preparationInstructions,
      root.instructions,
      extractedPreparation,
    ),
  );

  return {
    title:
      pickFirst(
        merged.recommendedRecipeName,
        merged.recipeTitle,
        merged.recipeName,
        merged.title,
        merged.name,
        root.recipeTitle,
      ) || i18n.t("aiConsultation.result.defaultTitle"),
    condition: pickFirst(merged.condition, merged.medicalCondition, merged.focusArea),
    cautionWarning: pickFirst(
      merged.cautionWarning,
      merged.precautions,
      merged.warnings,
      merged.contraindications,
    ),
    ingredients,
    preparationInstructions,
    confidenceScore:
      Number(merged.confidenceScore ?? root.confidenceScore ?? 0) || null,
    raw: merged,
  };
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
    i18n.t("aiConsultation.result.messages.generateError")
  );
};
