import {
  getMyMedicalHistory,
  getMyPatientProfile,
  getUserById,
  updateMyAddress,
  updateMyPatientProfile,
  upsertMyMedicalHistory,
} from "../api/patients";

export const DEFAULT_MEDICAL_HISTORY = {
  diabetes: false,
  hypertension: false,
  asthma: false,
  heartDisease: false,
  kidneyDisease: false,
  liverDisease: false,
  smoker: false,
  pregnancy: false,
  otherNotes: "",
};

export const DEFAULT_ADDRESS = {
  governorate: "",
  city: "",
  street: "",
};

export const DEFAULT_PATIENT_INFO = {
  birthDate: "",
  gender: "",
};

const PATIENT_INFO_STORAGE_KEY = "patient_profile_info";
const PATIENT_USER_STORAGE_KEY = "patient_dashboard_user";

export const MEDICAL_CONDITIONS = [
  { name: "diabetes", label: "Diabetes" },
  { name: "hypertension", label: "Hypertension" },
  { name: "asthma", label: "Asthma" },
  { name: "heartDisease", label: "Heart Disease" },
  { name: "kidneyDisease", label: "Kidney Disease" },
  { name: "liverDisease", label: "Liver Disease" },
  { name: "smoker", label: "Smoker" },
  { name: "pregnancy", label: "Pregnancy" },
];

const normalizeDateForInput = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const normalizeGender = (value) => {
  if (!value) {
    return "";
  }

  const normalizedValue = String(value).toLowerCase();

  if (normalizedValue === "male") {
    return "Male";
  }

  if (normalizedValue === "female") {
    return "Female";
  }

  return String(value);
};

const getStoredPatientInfo = () => {
  try {
    const rawValue = localStorage.getItem(PATIENT_INFO_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const storePatientInfo = (patientInfo) => {
  try {
    localStorage.setItem(PATIENT_INFO_STORAGE_KEY, JSON.stringify(patientInfo));
  } catch {
    return;
  }
};

const getStoredPatientUser = () => {
  try {
    const rawValue = localStorage.getItem(PATIENT_USER_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const storePatientUser = (patientUser) => {
  try {
    localStorage.setItem(PATIENT_USER_STORAGE_KEY, JSON.stringify(patientUser));
  } catch {
    return;
  }
};

const pickFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const normalizePatientUser = (user = {}) => ({
  ...user,
  id: pickFirstDefined(user.id, user.userId, user.userID),
  userId: pickFirstDefined(user.userId, user.id, user.userID),
  fullName: pickFirstDefined(user.fullName, user.name),
  name: pickFirstDefined(user.name, user.fullName),
  userName: pickFirstDefined(user.userName, user.username),
  username: pickFirstDefined(user.username, user.userName),
  email: pickFirstDefined(user.email, user.mail),
  phone: pickFirstDefined(user.phone, user.phoneNumber),
  governorate: pickFirstDefined(user.governorate),
  city: pickFirstDefined(user.city),
  street: pickFirstDefined(user.street),
});

export const getPersistedPatientUser = () => {
  const persistedUser = getStoredPatientUser();

  if (!persistedUser) {
    return null;
  }

  return normalizePatientUser(persistedUser);
};

export const buildPatientDashboardUser = ({ authUser, userDetails }) => {
  const persistedUser = getStoredPatientUser();
  const resolvedUser = normalizePatientUser({
    ...(persistedUser || {}),
    ...(authUser || {}),
    ...(userDetails || {}),
  });

  if (Object.keys(resolvedUser).length > 0) {
    storePatientUser(resolvedUser);
  }

  return resolvedUser;
};

export const buildPatientProfileState = ({
  userDetails,
  medicalHistory,
  patientInfo,
}) => {
  const persistedPatientInfo = getStoredPatientInfo();

  // Prefer API values when present (including empty string), but keep local storage values when API returns null/undefined.
  const birthDateValue =
    patientInfo?.birthDate != null
      ? patientInfo.birthDate
      : persistedPatientInfo?.birthDate;

  const genderValue =
    patientInfo?.gender != null
      ? patientInfo.gender
      : persistedPatientInfo?.gender;

  const resolvedPatientInfo = {
    ...persistedPatientInfo,
    ...(patientInfo || {}),
    birthDate: birthDateValue,
    gender: genderValue,
  };

  return {
    ...DEFAULT_PATIENT_INFO,
    ...DEFAULT_ADDRESS,
    ...DEFAULT_MEDICAL_HISTORY,
    birthDate: normalizeDateForInput(resolvedPatientInfo?.birthDate),
    gender: normalizeGender(resolvedPatientInfo?.gender),
    governorate: userDetails?.governorate ?? "",
    city: userDetails?.city ?? "",
    street: userDetails?.street ?? "",
    diabetes: medicalHistory?.diabetes ?? false,
    hypertension: medicalHistory?.hypertension ?? false,
    asthma: medicalHistory?.asthma ?? false,
    heartDisease: medicalHistory?.heartDisease ?? false,
    kidneyDisease: medicalHistory?.kidneyDisease ?? false,
    liverDisease: medicalHistory?.liverDisease ?? false,
    smoker: medicalHistory?.smoker ?? false,
    pregnancy: medicalHistory?.pregnancy ?? false,
    otherNotes: medicalHistory?.otherNotes ?? "",
  };
};

export const getPatientDashboardData = async (userId) => {
  const [userDetails, medicalHistory, patientInfo] = await Promise.all([
    userId ? getUserById(userId) : Promise.resolve(null),
    getMyMedicalHistory().catch(() => null),
    getMyPatientProfile().catch(() => null),
  ]);

  return {
    userDetails: normalizePatientUser(userDetails || {}),
    medicalHistory,
    patientInfo,
    profile: buildPatientProfileState({
      userDetails,
      medicalHistory,
      patientInfo,
    }),
  };
};

export const savePatientProfile = async (profile) => {
  const patientInfoPayload = {
    birthDate: profile.birthDate || null,
    gender: profile.gender || null,
  };

  const addressPayload = {
    governorate: profile.governorate,
    city: profile.city,
    street: profile.street,
  };

  const medicalHistoryPayload = {
    diabetes: profile.diabetes,
    hypertension: profile.hypertension,
    asthma: profile.asthma,
    heartDisease: profile.heartDisease,
    kidneyDisease: profile.kidneyDisease,
    liverDisease: profile.liverDisease,
    smoker: profile.smoker,
    pregnancy: profile.pregnancy,
    otherNotes: profile.otherNotes,
  };

  await Promise.all([
    updateMyPatientProfile(patientInfoPayload),
    updateMyAddress(addressPayload),
    upsertMyMedicalHistory(medicalHistoryPayload),
  ]);

  storePatientInfo(patientInfoPayload);

  return {
    patientInfoPayload,
    addressPayload,
    medicalHistoryPayload,
  };
};

export const getActiveConditions = (profile) =>
  MEDICAL_CONDITIONS.filter((condition) => profile?.[condition.name]).map(
    (condition) => condition.label,
  );
