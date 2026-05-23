import DashboardSettingsPage from "@components/common/DashboardSettingsPage";
import {
  deleteHerbalistAccount,
  resetHerbalistAccount,
  updateCurrentUserProfile,
} from "@services/accountSettings";

function HerbalistSettings({ user }) {
  const userId = user?.userId || user?.id;

  return (
    <DashboardSettingsPage
      user={user}
      onUpdateProfile={(payload) => updateCurrentUserProfile(payload)}
      onResetPassword={({ email, oldPassword, newPassword }) =>
        resetHerbalistAccount(email, oldPassword, newPassword)
      }
      onDeleteAccount={() => deleteHerbalistAccount(userId)}
    />
  );
}

export default HerbalistSettings;
