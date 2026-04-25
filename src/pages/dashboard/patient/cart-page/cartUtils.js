export const getHerbTotal = (herb) =>
  herb.pricePerKilo ? (herb.pricePerKilo * herb.quantityPerGram) / 1000 : 0;

export const getRecipeTotal = (recipe) =>
  Number(recipe.unitPrice ?? recipe.price ?? 0) * Number(recipe.quantity || 0);

export const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;
