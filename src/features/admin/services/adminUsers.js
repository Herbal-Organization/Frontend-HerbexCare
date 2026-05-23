const pickFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const ADMIN_USER_ROLES = ["Patient", "Herbalist", "SuperAdmin"];

export const normalizeAdminUser = (raw = {}) => ({
  id: pickFirstDefined(raw.id, raw.userId, raw.userID),
  fullName: pickFirstDefined(
    raw.fullName,
    raw.name,
    raw.userName,
    raw.username,
  ),
  userName: pickFirstDefined(raw.userName, raw.username),
  email: pickFirstDefined(raw.email, raw.mail),
  phone: pickFirstDefined(raw.phone, raw.phoneNumber),
  role: pickFirstDefined(raw.role, raw.userRole, raw.accountType, raw.type),
  governorate: pickFirstDefined(raw.governorate),
  city: pickFirstDefined(raw.city),
  street: pickFirstDefined(raw.street),
});

export const extractUsersList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const normalizeUsersResponse = (payload) => ({
  items: extractUsersList(payload).map(normalizeAdminUser),
  pageNumber:
    payload?.pageNumber ??
    payload?.PageNumber ??
    payload?.data?.pageNumber ??
    1,
  totalPages:
    payload?.totalPages ??
    payload?.TotalPages ??
    payload?.data?.totalPages ??
    1,
  totalCount:
    payload?.totalCount ??
    payload?.TotalCount ??
    payload?.data?.totalCount ??
    0,
  hasNextPage:
    payload?.hasNextPage ??
    payload?.HasNextPage ??
    payload?.data?.hasNextPage ??
    false,
  hasPreviousPage:
    payload?.hasPreviousPage ??
    payload?.HasPreviousPage ??
    payload?.data?.hasPreviousPage ??
    false,
});

export const getUserInitials = (user = {}) => {
  const parts = String(user.fullName || user.userName || user.email || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const formatUserLocation = (user = {}) => {
  const parts = [user.governorate, user.city, user.street].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "No location";
};

export const matchesUserSearch = (user = {}, searchValue = "") => {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) return true;

  return [
    user.fullName,
    user.userName,
    user.email,
    user.phone,
    user.role,
    user.governorate,
    user.city,
    user.street,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedSearch);
};

export const filterUsersByRole = (users = [], roleFilter = "All") => {
  if (!roleFilter || roleFilter === "All") return users;
  return users.filter(
    (user) =>
      String(user.role || "").toLowerCase() === roleFilter.toLowerCase(),
  );
};

export const getAdminUserStats = (users = []) => {
  const totalUsers = users.length;
  const activeHerbalists = users.filter(
    (user) => String(user.role || "").toLowerCase() === "herbalist",
  ).length;
  const newPatients = users.filter(
    (user) => String(user.role || "").toLowerCase() === "patient",
  ).length;

  return {
    totalUsers,
    activeHerbalists,
    newPatients,
  };
};

export const getUserRoleTone = (role = "") => {
  const normalizedRole = String(role).toLowerCase();

  if (normalizedRole === "patient") {
    return "bg-sky-100 text-sky-700 border-sky-200";
  }

  if (normalizedRole === "herbalist") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (normalizedRole === "superadmin") {
    return "bg-violet-100 text-violet-700 border-violet-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};
