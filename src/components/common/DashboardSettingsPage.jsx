import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaLanguage,
  FaLock,
  FaMoon,
  FaShieldAlt,
  FaSun,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";
import { useTheme } from "@context/ThemeContext";
import SettingsAccordionSection from "@components/common/SettingsAccordionSection";

const DEFAULT_OPEN_SECTIONS = {
  profile: false,
  password: false,
  language: false,
  appearance: false,
  delete: false,
};

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
  "block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/15";

const readOnlyInputClassName =
  "block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed";

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
  const { isDark, setTheme } = useTheme();
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
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);

  const resolvedEmail = useMemo(() => user?.email || "", [user?.email]);
  const currentLanguage = i18n.language?.startsWith("ar") ? "ar" : "en";
  const displayName = useMemo(
    () => getReadableName(user, t("dashboardSettings.account.unknown")),
    [t, user],
  );

  useEffect(() => {
    setProfileForm(buildProfileForm(user));
  }, [user]);

  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

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
      governorate: profileForm.governorate.trim(),
      city: profileForm.city.trim(),
      street: profileForm.street.trim(),
    };

    setIsSavingProfile(true);
    try {
      await onUpdateProfile(payload);
      setProfileForm((current) => ({
        ...current,
        ...payload,
      }));
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
    <div className="relative min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(56,161,105,0.16),transparent_68%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 w-full">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
        >
          <div className="p-6 md:p-8">
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
          </div>
        </motion.section>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {t("dashboardSettings.sections.hint")}
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 flex flex-col gap-4"
        >
          <SettingsAccordionSection
            id="profile"
            isOpen={openSections.profile}
            onToggle={() => toggleSection("profile")}
            icon={FaUserCircle}
            iconWrapperClassName="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
            title={t("dashboardSettings.profile.title")}
            description={t("dashboardSettings.profile.description")}
          >
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileError ? (
                <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {profileError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("dashboardSettings.profile.fields.email")}
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    readOnly
                    aria-readonly="true"
                    className={readOnlyInputClassName}
                    title={t(
                      "dashboardSettings.profile.fields.emailReadOnly",
                      "Email is managed separately.",
                    )}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      "dashboardSettings.profile.fields.emailReadOnly",
                      "Email is managed separately.",
                    )}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("dashboardSettings.profile.fields.phone")}
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    readOnly
                    aria-readonly="true"
                    className={readOnlyInputClassName}
                    title={t(
                      "dashboardSettings.profile.fields.phoneReadOnly",
                      "Phone is managed separately.",
                    )}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      "dashboardSettings.profile.fields.phoneReadOnly",
                      "Phone is managed separately.",
                    )}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
          </SettingsAccordionSection>

          <SettingsAccordionSection
            id="password"
            isOpen={openSections.password}
            onToggle={() => toggleSection("password")}
            icon={FaLock}
            iconWrapperClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            title={t("dashboardSettings.security.password.title")}
            description={t("dashboardSettings.security.password.description")}
          >
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError ? (
                <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {passwordError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
          </SettingsAccordionSection>

          <SettingsAccordionSection
            id="language"
            isOpen={openSections.language}
            onToggle={() => toggleSection("language")}
            icon={FaLanguage}
            iconWrapperClassName="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
            title={t("dashboardSettings.language.title")}
            description={t("dashboardSettings.language.description")}
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
          </SettingsAccordionSection>

          <SettingsAccordionSection
            id="appearance"
            isOpen={openSections.appearance}
            onToggle={() => toggleSection("appearance")}
            icon={FaMoon}
            iconWrapperClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
            title={t("dashboardSettings.appearance.title")}
            description={t("dashboardSettings.appearance.description")}
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("dashboardSettings.appearance.modeLabel")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    !isDark
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-primary/40"
                  }`}
                  aria-pressed={!isDark}
                >
                  <FaSun className="text-base" aria-hidden />
                  {t("dashboardSettings.appearance.light")}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    isDark
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-primary/40"
                  }`}
                  aria-pressed={isDark}
                >
                  <FaMoon className="text-base" aria-hidden />
                  {t("dashboardSettings.appearance.dark")}
                </button>
              </div>
            </div>
          </SettingsAccordionSection>

          <SettingsAccordionSection
            id="delete"
            isOpen={openSections.delete}
            onToggle={() => toggleSection("delete")}
            icon={FaTrash}
            iconWrapperClassName="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
            title={t("dashboardSettings.security.delete.title")}
            description={t("dashboardSettings.security.delete.description")}
            variant="danger"
          >
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {deleteError ? (
                <div className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                  {deleteError}
                </div>
              ) : null}

              <p className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-slate-300">
                {t("profile.modals.deleteAccount.warning")}
              </p>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("profile.modals.deleteAccount.confirmLabel")}
                  <span className="font-bold text-rose-700 dark:text-rose-400">
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
          </SettingsAccordionSection>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardSettingsPage;
