const DEFAULT_API_BASE_URL =
  "https://herbal-api-v1-geg9dub2brgee4ag.austriaeast-01.azurewebsites.net";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

