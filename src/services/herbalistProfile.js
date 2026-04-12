import { getUserById } from "../api/patients";
import {
  getMyHerbalistProfile,
  updateMyHerbalistProfile,
} from "../api/herbalists";

const HERBALIST_PROFILE_STORAGE_KEY = "herbalist_profile_info";

const normalizeTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
};

const formatTimeForApi = (value) => {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue.substring(0, 5);
  }

  if (/^\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return normalizedValue;
};

const getStoredHerbalistProfile = () => {
  try {
    const rawValue = localStorage.getItem(HERBALIST_PROFILE_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const storeHerbalistProfile = (profile) => {
  try {
    localStorage.setItem(
      HERBALIST_PROFILE_STORAGE_KEY,
      JSON.stringify(profile),
    );
  } catch {
    return;
  }
};

const pickFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const normalizeHerbalistUser = (user = {}) => ({
  ...user,
  id: pickFirstDefined(user.id, user.userId, user.userID),
  userId: pickFirstDefined(user.userId, user.id, user.userID),
  fullName: pickFirstDefined(user.fullName, user.name),
  name: pickFirstDefined(user.name, user.fullName),
  userName: pickFirstDefined(user.userName, user.username),
  username: pickFirstDefined(user.username, user.userName),
  email: pickFirstDefined(user.email, user.mail),
  phone: pickFirstDefined(user.phone, user.phoneNumber),
});

export const normalizeHerbalistProfile = (profile = {}) => {
  const persistedProfile = getStoredHerbalistProfile();
  const resolvedProfile = {
    ...(persistedProfile || {}),
    ...(profile || {}),
  };

  return {
    id: pickFirstDefined(resolvedProfile.id, resolvedProfile.herbalistId),
    userId: pickFirstDefined(resolvedProfile.userId, resolvedProfile.userID),
    licenseNumber: pickFirstDefined(resolvedProfile.licenseNumber),
    averageRating: pickFirstDefined(resolvedProfile.averageRating),
    bio: pickFirstDefined(resolvedProfile.bio) || "",
    availableFrom: normalizeTime(resolvedProfile.availableFrom),
    availableTo: normalizeTime(resolvedProfile.availableTo),
  };
};

export const getHerbalistDashboardData = async (userId) => {
  const [userDetails, herbalistProfile] = await Promise.all([
    userId ? getUserById(userId).catch(() => null) : Promise.resolve(null),
    getMyHerbalistProfile().catch(() => null),
  ]);

  const normalizedProfile = normalizeHerbalistProfile(herbalistProfile || {});

  if (herbalistProfile) {
    storeHerbalistProfile(normalizedProfile);
  }

  return {
    userDetails: normalizeHerbalistUser(userDetails || {}),
    herbalistProfile: normalizedProfile,
  };
};

export const saveHerbalistProfile = async (profile) => {
  const payload = {
    bio: profile.bio?.trim() || "",
    availableFrom: formatTimeForApi(profile.availableFrom),
    availableTo: formatTimeForApi(profile.availableTo),
  };

  await updateMyHerbalistProfile(payload);
  storeHerbalistProfile({
    ...normalizeHerbalistProfile(profile),
    ...payload,
  });
  return payload;
};
