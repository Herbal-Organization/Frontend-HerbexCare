import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FaPaperPlane, FaBell, FaUsers } from "react-icons/fa";
import { sendBulkNotification } from "@api/notifications";

const ROLE_OPTIONS = [
  { value: "All", label: "All Users" },
  { value: "Patient", label: "Patients" },
  { value: "Herbalist", label: "Herbalists" },
];

function AdminNotificationsPage() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("All");
  const [isSending, setIsSending] = useState(false);

  const canSend = title.trim().length > 0 && message.trim().length > 0;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canSend || isSending) return;

    setIsSending(true);
    try {
      await sendBulkNotification({
        title: title.trim(),
        message: message.trim(),
        targetRole,
      });
      toast.success(
        t("adminNotifications.sendSuccess", "Notification sent successfully!"),
      );
      setTitle("");
      setMessage("");
      setTargetRole("All");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminNotifications.sendError", "Failed to send notification.");
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            <FaBell className="text-sm" />
            Notifications
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
            {t("adminNotifications.title", "Send Notifications")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
            {t(
              "adminNotifications.subtitle",
              "Send bulk notifications to patients, herbalists, or all users at once.",
            )}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("adminNotifications.compose", "Compose Notification")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "adminNotifications.composeHint",
              "Fill in the details below and choose your target audience.",
            )}
          </p>
        </div>

        <form onSubmit={handleSend} className="mt-6 space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t("adminNotifications.targetRole", "Target Audience")}
            </label>
            <div className="flex flex-wrap gap-3">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTargetRole(option.value)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${
                    targetRole === option.value
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <FaUsers className="text-xs" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="notif-title"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("adminNotifications.titleLabel", "Title")}
            </label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(
                "adminNotifications.titlePlaceholder",
                "Notification title...",
              )}
              maxLength={200}
              className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 px-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="notif-message"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("adminNotifications.messageLabel", "Message")}
            </label>
            <textarea
              id="notif-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(
                "adminNotifications.messagePlaceholder",
                "Write your notification message...",
              )}
              rows={5}
              maxLength={2000}
              className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 px-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              {message.length}/2000
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSend || isSending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FaPaperPlane className="text-sm" />
            )}
            {isSending
              ? t("adminNotifications.sending", "Sending...")
              : t("adminNotifications.send", "Send Notification")}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AdminNotificationsPage;
