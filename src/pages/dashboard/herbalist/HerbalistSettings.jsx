import DashboardSettingsPage from "../../../components/shared/DashboardSettingsPage";
import { updateUser } from "../../../api/users";
import {
  deleteHerbalistAccount,
  resetHerbalistAccount,
} from "../../../services/accountSettings";

function HerbalistSettings({ user }) {
  const userId = user?.userId || user?.id;

  return (
    <DashboardSettingsPage
      user={user}
      onUpdateProfile={(payload) => updateUser(userId, payload)}
      onResetPassword={({ email, oldPassword, newPassword }) =>
        resetHerbalistAccount(email, oldPassword, newPassword)
      }
      onDeleteAccount={() => deleteHerbalistAccount(userId)}
    />
  );
}

export default HerbalistSettings;
