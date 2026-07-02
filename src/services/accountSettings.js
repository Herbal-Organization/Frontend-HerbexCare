import { resetPasswordAccount, deleteAccount } from "@api/accounts";
import {
  updateMyAddress,
  updateMyFullName,
  updateMyUserName,
} from "@api/users";
import {
  deleteMyHerbalistAccount,
  resetMyHerbalistAccount,
} from "@api/herbalists";
import { endAuthSession } from "@features/auth/services/authSession";

export const changePassword = async (email, oldPassword, newPassword) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    oldPassword,
    newPassword,
  };

  return resetPasswordAccount(payload);
};

export const deleteUserAccount = async (userId) => {
  await deleteAccount(userId);
  await endAuthSession();
  return true;
};

export const resetHerbalistAccount = async (
  email,
  oldPassword,
  newPassword,
) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    oldPassword,
    newPassword,
  };

  const response = await resetMyHerbalistAccount(payload);
  return response;
};

export const updateCurrentUserProfile = async ({
  fullName,
  userName,
  governorate,
  city,
  street,
}) => {
  const operations = [];

  const fullNamePayload = fullName?.trim();
  if (fullNamePayload) {
    operations.push(updateMyFullName({ fullName: fullNamePayload }));
  }

  const userNamePayload = userName?.trim();
  if (userNamePayload) {
    operations.push(updateMyUserName({ userName: userNamePayload }));
  }

  const addressPayload = {
    governorate: governorate?.trim(),
    city: city?.trim(),
    street: street?.trim(),
  };

  const hasAddress = Object.values(addressPayload).some(Boolean);
  if (hasAddress) {
    operations.push(updateMyAddress(addressPayload));
  }

  if (!operations.length) {
    return null;
  }

  const results = await Promise.allSettled(operations);
  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length > 0) {
    throw failed[0].reason;
  }

  return results;
};

export const deleteHerbalistAccount = async (userId) => {
  await deleteMyHerbalistAccount(userId);
  await endAuthSession();
  return true;
};
