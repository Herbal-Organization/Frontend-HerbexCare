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

  const normalizedValue = String(value).trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue.slice(0, 5);
  }

  if (/^\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const parsed = new Date(`1970-01-01T${normalizedValue}`);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatTimeForApi = (value) => {
  const normalizedValue = normalizeTime(value);

  if (!normalizedValue) {
    return "00:00";
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
  const incomingProfile = profile || {};
  const fallbackProfile = persistedProfile || {};

  return {
    id: pickFirstDefined(
      incomingProfile.id,
      incomingProfile.herbalistId,
      fallbackProfile.id,
      fallbackProfile.herbalistId,
    ),
    userId: pickFirstDefined(
      incomingProfile.userId,
      incomingProfile.userID,
      fallbackProfile.userId,
      fallbackProfile.userID,
    ),
    licenseNumber: pickFirstDefined(
      incomingProfile.licenseNumber,
      fallbackProfile.licenseNumber,
    ),
    averageRating: pickFirstDefined(
      incomingProfile.averageRating,
      fallbackProfile.averageRating,
    ),
    bio: pickFirstDefined(incomingProfile.bio, fallbackProfile.bio) || "",
    availableFrom: normalizeTime(
      pickFirstDefined(
        incomingProfile.availableFrom,
        fallbackProfile.availableFrom,
      ),
    ),
    availableTo: normalizeTime(
      pickFirstDefined(
        incomingProfile.availableTo,
        fallbackProfile.availableTo,
      ),
    ),
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

  // Re-read profile after update so UI reflects backend truth immediately.
  const updatedProfileResponse = await getMyHerbalistProfile().catch(
    () => null,
  );

  const normalizedUpdatedProfile = normalizeHerbalistProfile(
    updatedProfileResponse || {
      ...profile,
      ...payload,
    },
  );

  storeHerbalistProfile(normalizedUpdatedProfile);
  return normalizedUpdatedProfile;
};
