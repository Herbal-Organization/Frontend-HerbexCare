import { API_BASE_URL } from "../api/config";

const FALLBACK_HERB_IMAGE =
  "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80";

const splitBenefits = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value)
    .split(/[,.]| and /i)
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveImageUrl = (value) => {
  if (!value) {
    return FALLBACK_HERB_IMAGE;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

export const normalizeHerb = (herb) => ({
  id: herb.herbId,
  herbId: herb.herbId,
  herbName: herb.herbName || herb.name || "Unnamed herb",
  name: herb.herbName || herb.name || "Unnamed herb",
  scientificName: herb.scientificName || "Scientific name not available",
  description: herb.description || "No description is available for this herb yet.",
  benefits: herb.benefits || "",
  benefitList: splitBenefits(herb.benefits),
  dosage: herb.dosage || "Dosage guidance not available.",
  warnings: herb.warnings || "No warnings were provided.",
  imageURL: resolveImageUrl(herb.imageURL || herb.imageUrl),
  isApproved: herb.isApproved ?? null,
  addedByHerbalistId: herb.addedByHerbalistId ?? null,
  herbalistId: herb.herbalistId ?? herb.addedByHerbalistId ?? null,
  herbalistName: herb.herbalistName || "",
});
