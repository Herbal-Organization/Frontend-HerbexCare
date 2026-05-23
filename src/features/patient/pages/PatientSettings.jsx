import DashboardSettingsPage from "@components/common/DashboardSettingsPage";
import {
  changePassword,
  deleteUserAccount,
  updateCurrentUserProfile,
} from "@services/accountSettings";

function PatientSettings({ user }) {
  const userId = user?.userId || user?.id;

  return (
    <DashboardSettingsPage
      user={user}
      onUpdateProfile={(payload) => updateCurrentUserProfile(payload)}
      onResetPassword={({ email, oldPassword, newPassword }) =>
        changePassword(email, oldPassword, newPassword)
      }
      onDeleteAccount={() => deleteUserAccount(userId)}
    />
  );
}

export default PatientSettings;
