import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { FaBars, FaSpa } from "react-icons/fa";
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

  return (
    <div
      className={`flex min-h-screen text-slate-900 bg-slate-50 role-${role}`}
    >
      <DashboardSidebar
        role={role}
        user={user}
        navigation={navigation}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 md:ms-72 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 text-white">
              {isPatient ? (
                <FaSpa className="text-lg" />
              ) : (
                <MdEco className="text-lg" />
              )}
            </div>
            <span className="font-bold text-slate-900">
              {t(`${role}Sidebar.brand`, "Herbal Care AI")}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1">
            {error && (
              <div className="m-4 md:m-8 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {children}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 sm:px-8 py-4 text-xs text-slate-400">
            Herbal Care AI &copy; {new Date().getFullYear()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
