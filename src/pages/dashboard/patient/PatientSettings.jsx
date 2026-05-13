import DashboardSettingsPage from "../../../components/shared/DashboardSettingsPage";
import { updateUser } from "../../../api/users";
import {
  changePassword,
  deleteUserAccount,
} from "../../../services/accountSettings";

function PatientSettings({ user }) {
  const userId = user?.userId || user?.id;

  return (
    <DashboardSettingsPage
      user={user}
      onUpdateProfile={(payload) => updateUser(userId, payload)}
      onResetPassword={({ email, oldPassword, newPassword }) =>
        changePassword(email, oldPassword, newPassword)
      }
      onDeleteAccount={() => deleteUserAccount(userId)}
    />
  );
}

export default PatientSettings;
