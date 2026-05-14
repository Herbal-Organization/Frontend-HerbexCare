import React from "react";
import { useTranslation } from "react-i18next";
import {
  MdEco,
  MdDashboard,
  MdLocalFlorist,
  MdMenuBook,
  MdBiotech,
  MdInventory,
  MdShoppingCart,
  MdPerson,
  MdLogout,
  MdSettings,
} from "react-icons/md";

function Sidebar({ currentPath, onNavigate, user, onLogout, ordersCount }) {
  const { t } = useTranslation();
  const navigation = [
    { name: t("herbalistSidebar.dashboard"), href: "/herbalist/dashboard" },
    {
      name: t("herbalistSidebar.manageHerbs"),
      href: "/herbalist/dashboard/herbs",
    },
    {
      name: t("herbalistSidebar.manageRecipes"),
      href: "/herbalist/dashboard/recipes",
    },
    {
      name: t("herbalistSidebar.manageDiseases"),
      href: "/herbalist/dashboard/diseases",
    },
    {
      name: t("herbalistSidebar.inventory"),
      href: "/herbalist/dashboard/inventory",
    },
    {
      name: t("herbalistSidebar.orders"),
      href: "/herbalist/dashboard/orders",
      badge: Number.isFinite(ordersCount) ? String(ordersCount) : null,
    },
    {
      name: t("herbalistSidebar.profile"),
      href: "/herbalist/dashboard/profile",
    },
    {
      name: t("herbalistSidebar.settings"),
      href: "/herbalist/dashboard/settings",
    },
  ];

  const handleClick = (event, href) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <aside className="w-72 flex flex-col bg-white border-e border-slate-200 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
          <MdEco className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg leading-none">
            Herbal Care AI
          </h1>
          <p className="text-slate-500 text-xs mt-1">Practitioner Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive =
            item.href === "/herbalist/dashboard"
              ? currentPath === "/herbalist/dashboard" ||
                currentPath === "/herbalist/dashboard/"
              : currentPath.startsWith(item.href);

          return (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.name === t("herbalistSidebar.dashboard") && (
                <MdDashboard className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.manageHerbs") && (
                <MdLocalFlorist className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.manageRecipes") && (
                <MdMenuBook className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.manageDiseases") && (
                <MdBiotech className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.inventory") && (
                <MdInventory className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.orders") && (
                <MdShoppingCart className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.profile") && (
                <MdPerson className="w-5 h-5" />
              )}
              {item.name === t("herbalistSidebar.settings") && (
                <MdSettings className="w-5 h-5" />
              )}
              <span>{item.name}</span>
              {item.badge && (
                <span className="ms-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "H"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">
              {user?.name || "Herbalist"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role || t("herbalistSidebar.member")}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="ms-auto flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md shadow-md hover:bg-primary-hover hover:scale-105 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <MdLogout className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
