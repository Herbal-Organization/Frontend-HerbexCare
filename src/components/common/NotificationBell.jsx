import { useState, useEffect, useRef, useCallback } from "react";
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@api/notifications";

function NotificationBell() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getMyNotifications();
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];
      setNotifications(items);
    } catch {
      // Silently fail for background polling
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      toast.error(t("notifications.markReadError", "Failed to mark as read"));
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(
        t("notifications.allMarkedRead", "All notifications marked as read"),
      );
    } catch {
      toast.error(
        t("notifications.markAllReadError", "Failed to mark all as read"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error(
        t("notifications.deleteError", "Failed to delete notification"),
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t("notifications.justNow", "Just now");
    if (diffMins < 60)
      return t("notifications.minutesAgo", "{{count}}m ago", {
        count: diffMins,
      });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return t("notifications.hoursAgo", "{{count}}h ago", {
        count: diffHours,
      });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7)
      return t("notifications.daysAgo", "{{count}}d ago", { count: diffDays });
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        aria-label={t("notifications.title", "Notifications")}
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t("notifications.title", "Notifications")}
              {unreadCount > 0 && (
                <span className="ms-2 inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                  {unreadCount}{" "}
                  {t("notifications.unread", "unread")}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
              >
                <FaCheckDouble className="text-[9px]" />
                {t("notifications.markAllRead", "Mark all read")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FaBell className="mx-auto mb-3 text-2xl text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "notifications.empty",
                    "No notifications yet",
                  )}
                </p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 border-b border-slate-50 dark:border-slate-700/50 px-4 py-3 transition-colors last:border-b-0 ${
                    notification.isRead
                      ? "bg-white dark:bg-slate-800"
                      : "bg-emerald-50/50 dark:bg-emerald-900/10"
                  }`}
                >
                  <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      notification.isRead
                        ? "bg-transparent"
                        : "bg-emerald-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                      {formatDate(
                        notification.createdAt || notification.createdDate,
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                        title={t("notifications.markRead", "Mark as read")}
                      >
                        <FaCheck className="text-[10px]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title={t("notifications.delete", "Delete")}
                    >
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
