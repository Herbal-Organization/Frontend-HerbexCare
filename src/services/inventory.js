const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeInventoryItem = (item) => {
  const herb = item?.herb || {};
  const inventoryId =
    item?.inventoryId ?? item?.id ?? item?.herbInventoryId ?? null;
  const herbId = item?.herbId ?? herb?.herbId ?? herb?.id ?? item?.id ?? null;

  return {
    inventoryId,
    id: inventoryId ?? herbId,
    herbId,
    herbName: item?.herbName || herb?.herbName || herb?.name || "Unknown herb",
    scientificName:
      item?.scientificName ||
      herb?.scientificName ||
      "Scientific name unavailable",
    description: item?.description || herb?.description || "",
    imageURL:
      item?.imageURL ||
      item?.imageUrl ||
      herb?.imageURL ||
      herb?.imageUrl ||
      "",
    pricePerKilo:
      toNumberOrNull(item?.pricePerKilo) ??
      toNumberOrNull(item?.price) ??
      toNumberOrNull(item?.pricePerKg),
    isActive: item?.isActive ?? true,
    raw: item,
  };
};

export const normalizeInventoryList = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeInventoryItem);
};
