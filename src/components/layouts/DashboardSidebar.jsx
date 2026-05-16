import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTimes, FaSignOutAlt, FaHome } from "react-icons/fa";
import { MdAdd, MdRemove, MdEco } from "react-icons/md";
import { FaSpa } from "react-icons/fa";

function DashboardSidebar({
  role,
  user,
  navigation,
  onLogout,
  isOpen,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState({});

  const displayName =
    user?.name || user?.email || t(`${role}Sidebar.member`, "Member");

  const toggleExpand = (name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleNavClick = (href, hasChildren, name) => {
    if (hasChildren) {
      toggleExpand(name);
    } else {
      navigate(href);
      if (onClose) onClose();
    }
  };

  const isPatient = role === "patient";

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 start-0 z-50 h-full w-72 bg-white border-e border-slate-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Branding Area */}
        <div className="p-6 flex items-center gap-3">
          <div
            className={`rounded-lg p-2 text-white flex items-center justify-center ${
              isPatient ? "bg-primary" : "bg-primary"
            }`}
          >
            {isPatient ? (
              <FaSpa className="text-2xl" />
            ) : (
              <MdEco className="text-2xl" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-slate-900 font-bold text-lg leading-none truncate">
              {t(`${role}Sidebar.brand`, "Herbal Care AI")}
            </h1>
            <p className="text-primary text-xs font-medium mt-1 truncate">
              {isPatient
                ? t("patientSidebar.tagline", "Your Natural Path")
                : "Practitioner Portal"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems[item.name];
            const isCurrent =
              item.href === `/${role}/dashboard`
                ? location.pathname === `/${role}/dashboard` ||
                  location.pathname === `/${role}/dashboard/`
                : location.pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <div key={item.name} className="flex flex-col">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleNavClick(item.href, hasChildren, item.name)
                    }
                    className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-start text-sm font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {typeof Icon === "function" ? (
                      <Icon className="text-base" />
                    ) : (
                      Icon
                    )}
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ms-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className="p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {isExpanded ? (
                        <MdRemove className="w-4 h-4" />
                      ) : (
                        <MdAdd className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="ms-6 mt-1 space-y-1 border-s border-slate-100 ps-2">
                    {item.children.map((child) => {
                      const isChildCurrent = location.pathname === child.href;
                      const ChildIcon = child.icon;
                      return (
                        <button
                          key={child.name}
                          type="button"
                          onClick={() => handleNavClick(child.href)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isChildCurrent
                              ? "text-primary bg-primary/5"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          {typeof ChildIcon === "function" ? (
                            <ChildIcon className="w-4 h-4" />
                          ) : (
                            ChildIcon
                          )}
                          <span>{child.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 space-y-2">
            {isPatient && (
              <button
                type="button"
                onClick={() => navigate("/patient/home")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-start text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
              >
                <FaHome className="text-primary" />
                <span>{t("patientSidebar.home")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>{t(`${role}Sidebar.signOut`, "Sign Out")}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role || t(`${role}Sidebar.member`, "Member")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
