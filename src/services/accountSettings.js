import { resetPasswordAccount, deleteAccount } from "../api/accounts";
import {
  deleteMyHerbalistAccount,
  resetMyHerbalistAccount,
} from "../api/herbalists";
import { endAuthSession } from "./authSession";

export const changePassword = async (email, oldPassword, newPassword) => {
  const payload = {
    email: email?.trim().toLowerCase(),
    oldPassword,
    newPassword,
  };

  try {
    const response = await resetPasswordAccount(payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    // Delete the account via API
    await deleteAccount(userId);

    // Clear session and redirect to login
    await endAuthSession();

    return true;
  } catch (error) {
    throw error;
  }
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

export const deleteHerbalistAccount = async (userId) => {
  await deleteMyHerbalistAccount(userId);
  await endAuthSession();
  return true;
};
