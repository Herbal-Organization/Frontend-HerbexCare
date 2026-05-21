const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export function normalizeHerbalist(raw = {}) {
  const herbalistId = Number(
    pickFirst(
      raw.herbalistId,
      raw.id,
      raw.targetId,
      raw.userId,
      raw.userID,
    ) || 0,
  );

  return {
    herbalistId,
    userId: pickFirst(raw.userId, raw.userID, raw.userId),
    fullName: pickFirst(
      raw.fullName,
      raw.name,
      raw.userName,
      raw.username,
      "Herbalist",
    ),
    bio: pickFirst(raw.bio, "") || "",
    licenseNumber: pickFirst(raw.licenseNumber, ""),
    averageRating: raw.averageRating != null ? Number(raw.averageRating) : null,
    availableFrom: pickFirst(raw.availableFrom, ""),
    availableTo: pickFirst(raw.availableTo, ""),
    createdDate: pickFirst(
      raw.createdDate,
      raw.favoritedAt,
      raw.savedDate,
    ),
  };
}

export function extractFavoriteItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
