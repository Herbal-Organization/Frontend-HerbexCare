const formatRecipeDate = (value) => {
  if (!value) {
    return "Recently added";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently added";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatNumber = (value, digits = 1) => {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }

  return Number(value).toFixed(digits);
};

export const normalizeRecipe = (recipe) => ({
  id: recipe.recipeId,
  herbalistId: recipe.herbalistId ?? null,
  title: recipe.description || "Untitled Recipe",
  description:
    recipe.instructions ||
    "No preparation instructions available.",
  instructions: recipe.instructions || "No preparation instructions available.",
  price: recipe.price ?? 0,
  herbs: recipe.herbs ?? [],
  targetedDiseases: recipe.targetedDiseases ?? [],
  createdByAI: Boolean(recipe.createdByAI),
  averageRating: recipe.averageRating ?? null,
  averageRatingLabel: formatNumber(recipe.averageRating),
  totalRatings: recipe.totalRatings ?? null,
  herbalistAverageRating: recipe.herbalistAverageRating ?? null,
  herbalistAverageRatingLabel: formatNumber(recipe.herbalistAverageRating),
  herbalistTotalRatings: recipe.herbalistTotalRatings ?? null,
  isActive: recipe.isActive ?? null,
  rawCreatedDate: recipe.createdDate ?? null,
  createdDate: formatRecipeDate(recipe.createdDate),
});

export const filterRecipes = (recipes, searchTerm) => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return recipes;
  }

  return recipes.filter((recipe) => {
    const searchableText = [
      recipe.title,
      recipe.description,
      recipe.instructions,
      recipe.herbalistId ? String(recipe.herbalistId) : "",
      recipe.herbs.map((herb) => herb.herbName).join(" "),
      recipe.targetedDiseases.map((disease) => disease.diseaseName).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });
};

export const buildRecipeAdvantages = (recipe, herbs) => {
  const advantages = [];

  if (recipe.targetedDiseases.length) {
    advantages.push(
      `Targets ${recipe.targetedDiseases
        .map((disease) => disease.diseaseName)
        .join(", ")}.`,
    );
  }

  herbs.forEach((herb) => {
    if (herb.benefits) {
      advantages.push(`${herb.herbName}: ${herb.benefits}`);
    }
  });

  if (recipe.createdByAI) {
    advantages.push("AI-generated recipe structure may speed up personalized drafting.");
  }

  return advantages;
};

export const buildRecipeDisadvantages = (recipe, herbs) => {
  const disadvantages = [];

  herbs.forEach((herb) => {
    if (herb.warnings) {
      disadvantages.push(`${herb.herbName}: ${herb.warnings}`);
    }
  });

  if (!recipe.targetedDiseases.length) {
    disadvantages.push("This recipe does not list a specific target condition.");
  }

  if (!herbs.length) {
    disadvantages.push("No herb details are attached to this recipe yet.");
  }

  return disadvantages;
};
