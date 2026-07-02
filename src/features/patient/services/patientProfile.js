import { getMyProfile, updateMyProfile } from "@api/patients";
import { updateUsersAddress, getMyUserDetails } from "@api/users";
import {
  getMyMedicalHistory,
  saveMyMedicalHistory,
} from "@api/medicalHistories";

export const DEFAULT_MEDICAL_HISTORY = {
  diabetes: false,
  hypertension: false,
  asthma: false,
  heartDisease: false,
  kidneyDisease: false,
  liverDisease: false,
  smoker: false,
  pregnancy: false,
  allergies: false,
  otherNotes: "",
};

export const DEFAULT_ADDRESS = {
  governorate: "",
  city: "",
  street: "",
};

export const DEFAULT_PATIENT_INFO = {
  medicalHistoryId: "",
  birthDate: "",
  genderName: "",
  gender: "",
  age: "",
};

const PATIENT_INFO_STORAGE_KEY = "patient_profile_info";
const PATIENT_USER_STORAGE_KEY = "patient_dashboard_user";
const PROFILE_COMPLETION_KEY = "patient_profile_completed";

export const MEDICAL_CONDITIONS = [
  { name: "diabetes", label: "Diabetes" },
  { name: "hypertension", label: "Hypertension" },
  { name: "asthma", label: "Asthma" },
  { name: "heartDisease", label: "Heart Disease" },
  { name: "kidneyDisease", label: "Kidney Disease" },
  { name: "liverDisease", label: "Liver Disease" },
  { name: "smoker", label: "Smoker" },
  { name: "pregnancy", label: "Pregnancy" },
  { name: "allergies", label: "Known Allergies" },
];

// Check if user has explicitly set gender and birthdate
export const isProfileComplete = (profile) => {
  // Profile is considered incomplete if gender or birthDate are empty/not set by user
  const genderValue = profile?.genderName || profile?.gender;
  const hasGender = genderValue && String(genderValue).trim() !== "";
  const hasBirthDate = profile?.birthDate && profile.birthDate.trim() !== "";
  return hasGender && hasBirthDate;
};

// Mark profile as completed after user fills in required fields
export const markProfileAsComplete = () => {
  try {
    localStorage.setItem(PROFILE_COMPLETION_KEY, "true");
  } catch {
    return;
  }
};

// Check if profile was already marked as complete
export const wasProfileCompleted = () => {
  try {
    return localStorage.getItem(PROFILE_COMPLETION_KEY) === "true";
  } catch {
    return false;
  }
};

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

const normalizeAge = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return String(value);
};

export const getStoredPatientInfo = () => {
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

const normalizePatientInfo = (patientInfo = {}) => {
  const medicalHistoryId = pickFirstDefined(
    patientInfo.medicalHistoryId,
    patientInfo.medicalHistoryID,
  );
  const birthDate = normalizeDateForInput(patientInfo.birthDate);
  const genderName = normalizeGender(
    pickFirstDefined(patientInfo.genderName, patientInfo.gender),
  );
  const age = normalizeAge(patientInfo.age);

  return {
    ...patientInfo,
    medicalHistoryId,
    birthDate,
    genderName,
    gender: genderName,
    age,
  };
};

export const normalizePatientUser = (user = {}) => {
  const id = pickFirstDefined(user.id, user.userId, user.userID);
  const userId = pickFirstDefined(user.userId, user.id, user.userID);
  const fullName = pickFirstDefined(user.fullName, user.name);
  const name = pickFirstDefined(user.name, user.fullName);
  const userName = pickFirstDefined(user.userName, user.username);
  const username = pickFirstDefined(user.username, user.userName);
  const email = pickFirstDefined(user.email, user.mail);
  const phone = pickFirstDefined(user.phone, user.phoneNumber);
  const governorate = pickFirstDefined(user.governorate);
  const city = pickFirstDefined(user.city);
  const street = pickFirstDefined(user.street);

  const res = { ...user };
  if (id !== undefined) res.id = id;
  if (userId !== undefined) res.userId = userId;
  if (fullName !== undefined) res.fullName = fullName;
  if (name !== undefined) res.name = name;
  if (userName !== undefined) res.userName = userName;
  if (username !== undefined) res.username = username;
  if (email !== undefined) res.email = email;
  if (phone !== undefined) res.phone = phone;
  if (governorate !== undefined) res.governorate = governorate;
  if (city !== undefined) res.city = city;
  if (street !== undefined) res.street = street;

  return res;
};

export const getPersistedPatientUser = () => {
  const persistedUser = getStoredPatientUser();

  if (!persistedUser) {
    return null;
  }

  return normalizePatientUser(persistedUser);
};

// Compute a simple profile completion percentage based on commonly used fields.
export const getProfileCompletionPercentage = () => {
  try {
    const user = getPersistedPatientUser() || {};
    const info = getStoredPatientInfo() || {};

    const fields = [
      user.fullName,
      user.email,
      user.phone,
      info.birthDate,
      info.genderName || info.gender,
      user.governorate,
      user.city,
      user.street,
    ];

    const total = fields.length;
    const filled = fields.reduce((acc, v) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return acc + 1;
      }
      return acc;
    }, 0);

    return Math.round((filled / total) * 100);
  } catch {
    return 0;
  }
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
  const resolvedPatientInfo = normalizePatientInfo({
    ...(persistedPatientInfo || {}),
    ...(patientInfo || {}),
  });

  return {
    ...DEFAULT_PATIENT_INFO,
    ...DEFAULT_ADDRESS,
    ...DEFAULT_MEDICAL_HISTORY,
    medicalHistoryId: resolvedPatientInfo?.medicalHistoryId || "",
    birthDate: resolvedPatientInfo?.birthDate || "",
    genderName: resolvedPatientInfo?.genderName || "",
    gender: resolvedPatientInfo?.gender || "",
    age: resolvedPatientInfo?.age || "",
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
    allergies: medicalHistory?.allergies ?? false,
    otherNotes: medicalHistory?.otherNotes ?? "",
  };
};

export const getPatientDashboardData = async (userId) => {
  // Fetch medical history, and auto-create if doesn't exist (404 for new users)
  let medicalHistory = null;
  try {
    medicalHistory = await getMyMedicalHistory();
  } catch (err) {
    // If 404 (not found), auto-initialize with default values for new users
    if (err.response?.status === 404) {
      try {
        medicalHistory = await saveMyMedicalHistory(DEFAULT_MEDICAL_HISTORY);
      } catch {
        // If initialization also fails, continue with null
        medicalHistory = null;
      }
    }
  }

  const [userDetails, patientInfo] = await Promise.all([
    userId ? getMyUserDetails(userId).catch(() => null) : Promise.resolve(null),
    getMyProfile().catch(() => null),
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
  // Build patient info payload - send only provided values to avoid backend null constraint issues.
  const patientInfoPayload = {};
  if (profile.birthDate && profile.birthDate.trim()) {
    patientInfoPayload.birthDate = profile.birthDate.trim();
  }
  const genderValue = (profile.genderName || profile.gender || "").trim();
  if (genderValue) {
    patientInfoPayload.gender = genderValue;
  }

  // Build address payload - send only provided values.
  const addressPayload = {};
  if (profile.governorate && profile.governorate.trim()) {
    addressPayload.governorate = profile.governorate.trim();
  }
  if (profile.city && profile.city.trim()) {
    addressPayload.city = profile.city.trim();
  }
  if (profile.street && profile.street.trim()) {
    addressPayload.street = profile.street.trim();
  }

  // Build medical history payload
  const medicalHistoryPayload = {
    diabetes: !!profile.diabetes,
    hypertension: !!profile.hypertension,
    asthma: !!profile.asthma,
    heartDisease: !!profile.heartDisease,
    kidneyDisease: !!profile.kidneyDisease,
    liverDisease: !!profile.liverDisease,
    smoker: !!profile.smoker,
    pregnancy: !!profile.pregnancy,
    allergies: !!profile.allergies,
    otherNotes:
      profile.otherNotes && profile.otherNotes.trim()
        ? profile.otherNotes.trim()
        : "",
  };

  const operations = [
    {
      name: "medical history",
      run: () => saveMyMedicalHistory(medicalHistoryPayload),
    },
  ];

  if (Object.keys(patientInfoPayload).length > 0) {
    operations.push({
      name: "patient info",
      run: () => updateMyProfile(patientInfoPayload),
    });
  }

  if (Object.keys(addressPayload).length > 0) {
    operations.push({
      name: "address",
      run: () => updateUsersAddress(addressPayload),
    });
  }

  const results = await Promise.allSettled(
    operations.map((operation) => operation.run()),
  );
  const failed = results
    .map((result, index) => ({ result, name: operations[index].name }))
    .filter(({ result }) => result.status === "rejected");

  if (failed.length === operations.length) {
    throw failed[0].result.reason;
  }

  if (Object.keys(patientInfoPayload).length > 0) {
    storePatientInfo({
      ...patientInfoPayload,
      genderName: patientInfoPayload.gender,
    });
  }

  return {
    patientInfoPayload,
    addressPayload,
    medicalHistoryPayload,
  };
};

export const getActiveConditions = (profile) =>
  MEDICAL_CONDITIONS.filter((condition) => profile?.[condition.name]).map(
    (condition) => condition.name,
  );
