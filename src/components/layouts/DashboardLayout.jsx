import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { FaBars, FaShieldAlt, FaSpa } from "react-icons/fa";
import { MdEco } from "react-icons/md";
import { useTranslation } from "react-i18next";

function DashboardLayout({
  role,
  user,
  navigation,
  onLogout,
  children,
  sidebarOpen,
  setSidebarOpen,
  error,
}) {
  const { t } = useTranslation();
  const isPatient = role === "patient";
  const isAdmin = role === "admin";

  return (
    <div
      className={`flex min-h-screen text-slate-900 bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 role-${role}`}
    >
      <DashboardSidebar
        role={role}
        user={user}
        navigation={navigation}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex h-dvh min-h-0 flex-1 flex-col lg:ms-72">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm shadow-slate-100/50 px-4 py-3 lg:hidden dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-slate-900/50">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 text-white">
              {isPatient ? (
                <FaSpa className="text-lg" />
              ) : isAdmin ? (
                <FaShieldAlt className="text-lg" />
              ) : (
                <MdEco className="text-lg" />
              )}
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-50">
              {t(`${role}Sidebar.brand`, "Herbal Care AI")}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            {error && (
              <div className="m-4 lg:m-8 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm shadow-red-100/50 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
