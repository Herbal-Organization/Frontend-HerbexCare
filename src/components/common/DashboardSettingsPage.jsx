import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaLanguage,
  FaLock,
  FaShieldAlt,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

const inputClassName =
  "block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

function getReadableName(user, fallbackLabel) {
  return (
    user?.fullName ||
    user?.name ||
    user?.userName ||
    user?.username ||
    user?.email ||
    fallbackLabel
  );
}

function extractErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallbackMessage
  );
}

function buildProfileForm(user) {
  return {
    fullName: user?.fullName || user?.name || "",
    userName: user?.userName || user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    governorate: user?.governorate || "",
    city: user?.city || "",
    street: user?.street || "",
  };
}

function DashboardSettingsPage({
  user,
  onResetPassword,
  onDeleteAccount,
  onUpdateProfile,
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const resolvedUserId = user?.userId || user?.id;
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(user));
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const resolvedEmail = useMemo(() => user?.email || "", [user?.email]);
  const currentLanguage = i18n.language?.startsWith("ar") ? "ar" : "en";
  const displayName = useMemo(
    () => getReadableName(user, t("dashboardSettings.account.unknown")),
    [t, user],
  );

  useEffect(() => {
    setProfileForm(buildProfileForm(user));
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");

    if (!resolvedUserId || !onUpdateProfile) {
      const message = t("dashboardSettings.messages.accountUnavailable");
      setProfileError(message);
      toast.error(message);
      return;
    }

    const payload = {
      fullName: profileForm.fullName.trim(),
      userName: profileForm.userName.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      governorate: profileForm.governorate.trim(),
      city: profileForm.city.trim(),
      street: profileForm.street.trim(),
    };

    setIsSavingProfile(true);
    try {
      await onUpdateProfile(payload);
      setProfileForm(payload);
      toast.success(t("dashboardSettings.messages.profileUpdateSuccess"));
    } catch (error) {
      const message = extractErrorMessage(
        error,
        t("dashboardSettings.messages.profileUpdateError"),
      );
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePassword = () => {
    if (!resolvedEmail) {
      return t("dashboardSettings.messages.accountUnavailable");
    }

    if (!passwordForm.currentPassword) {
      return t("profile.modals.changePassword.validation.currentRequired");
    }

    if (!passwordForm.newPassword) {
      return t("profile.modals.changePassword.validation.newRequired");
    }

    if (passwordForm.newPassword.length < 8) {
      return t("profile.modals.changePassword.validation.minLength");
    }

    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      return t("profile.modals.changePassword.validation.uppercase");
    }

    if (!/[a-z]/.test(passwordForm.newPassword)) {
      return t("profile.modals.changePassword.validation.lowercase");
    }

    if (!/[0-9]/.test(passwordForm.newPassword)) {
      return t("profile.modals.changePassword.validation.number");
    }

    if (!passwordForm.confirmNewPassword) {
      return t("profile.modals.changePassword.validation.confirmRequired");
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      return t("profile.modals.changePassword.validation.mismatch");
    }

    return "";
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");

    const validationMessage = validatePassword();
    if (validationMessage) {
      setPasswordError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setIsSavingPassword(true);
    try {
      await onResetPassword({
        email: resolvedEmail,
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success(t("profile.messages.passwordChangeSuccess"));
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      const message = extractErrorMessage(
        error,
        t("profile.messages.passwordChangeError"),
      );
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteError("");

    if (!resolvedEmail) {
      const message = t("dashboardSettings.messages.accountUnavailable");
      setDeleteError(message);
      toast.error(message);
      return;
    }

    if (deleteEmailConfirm.trim() !== resolvedEmail) {
      const message = t("dashboardSettings.messages.emailMismatch");
      setDeleteError(message);
      toast.error(message);
      return;
    }

    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
      toast.success(t("profile.messages.deleteSuccess"));
      navigate("/auth", { replace: true });
    } catch (error) {
      const message = extractErrorMessage(
        error,
        t("profile.messages.deleteAccountError"),
      );
      setDeleteError(message);
      toast.error(message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="relative min-h-full bg-slate-50">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(56,161,105,0.16),transparent_68%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
        >
          <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_320px] md:p-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                <FaShieldAlt className="text-[0.75rem]" />
                {t("dashboardSettings.kicker")}
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                  {t("dashboardSettings.title")}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  {t("dashboardSettings.subtitle")}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white">
                  <FaUserCircle className="text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    {t("dashboardSettings.account.signedInAs")}
                  </p>
                  <p className="truncate text-base font-bold text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-white/70">
                    {resolvedEmail}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <motion.section
            variants={itemVariants}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <FaUserCircle className="text-lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {t("dashboardSettings.profile.title")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("dashboardSettings.profile.description")}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
              {profileError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {profileError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.fullName")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(event) =>
                      handleProfileChange("fullName", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.userName")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.userName}
                    onChange={(event) =>
                      handleProfileChange("userName", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.email")}
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      handleProfileChange("email", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.phone")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(event) =>
                      handleProfileChange("phone", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.governorate")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.governorate}
                    onChange={(event) =>
                      handleProfileChange("governorate", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.city")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(event) =>
                      handleProfileChange("city", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("dashboardSettings.profile.fields.street")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.street}
                    onChange={(event) =>
                      handleProfileChange("street", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingProfile
                    ? t("dashboardSettings.profile.submitting")
                    : t("dashboardSettings.profile.submit")}
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FaLock className="text-lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {t("dashboardSettings.security.password.title")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("dashboardSettings.security.password.description")}
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              {passwordError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {passwordError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("profile.modals.changePassword.currentPassword")}
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("profile.modals.changePassword.newPassword")}
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t("profile.modals.changePassword.confirmPassword")}
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirmNewPassword: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingPassword
                    ? t("dashboardSettings.security.password.submitting")
                    : t("dashboardSettings.security.password.submit")}
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <FaLanguage className="text-lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {t("dashboardSettings.language.title")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("dashboardSettings.language.description")}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {t("dashboardSettings.language.title")}
              </label>
              <select
                value={currentLanguage}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                className={inputClassName}
                aria-label={t("dashboardSettings.language.title")}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 shadow-sm lg:col-span-2"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <FaTrash className="text-lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-rose-950">
                  {t("dashboardSettings.security.delete.title")}
                </h2>
                <p className="mt-1 text-sm text-rose-800">
                  {t("dashboardSettings.security.delete.description")}
                </p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="mt-6 space-y-4">
              {deleteError ? (
                <div className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700">
                  {deleteError}
                </div>
              ) : null}

              <p className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                {t("profile.modals.deleteAccount.warning")}
              </p>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t("profile.modals.deleteAccount.confirmLabel")}
                  <span className="font-bold text-rose-700">
                    {" "}
                    {resolvedEmail}
                  </span>
                </label>
                <input
                  type="email"
                  value={deleteEmailConfirm}
                  onChange={(event) =>
                    setDeleteEmailConfirm(event.target.value)
                  }
                  className={inputClassName}
                  placeholder={t("profile.modals.deleteAccount.placeholder", {
                    email: resolvedEmail,
                  })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDeletingAccount
                    ? t("dashboardSettings.security.delete.submitting")
                    : t("dashboardSettings.security.delete.submit")}
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardSettingsPage;
