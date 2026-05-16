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
  MdExpandMore,
  MdAdd,
  MdRemove,
} from "react-icons/md";
import { useState } from "react";

function Sidebar({ currentPath, onNavigate, user, onLogout, ordersCount }) {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navigation = [
    {
      name: t("herbalistSidebar.dashboard"),
      href: "/herbalist/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      name: t("herbalistSidebar.manageHerbs"),
      href: "/herbalist/dashboard/herbs",
      icon: <MdLocalFlorist className="w-5 h-5" />,
      children: [
        {
          name: t("herbalistSidebar.globalRegistry"),
          href: "/herbalist/dashboard/herbs/all",
          icon: <MdBiotech className="w-5 h-5" />,
        },
      ],
    },
    {
      name: t("herbalistSidebar.manageRecipes"),
      href: "/herbalist/dashboard/recipes",
      icon: <MdMenuBook className="w-5 h-5" />,
    },
    {
      name: t("herbalistSidebar.manageDiseases"),
      href: "/herbalist/dashboard/diseases",
      icon: <MdBiotech className="w-5 h-5" />,
    },
    {
      name: t("herbalistSidebar.inventory"),
      href: "/herbalist/dashboard/inventory",
      icon: <MdInventory className="w-5 h-5" />,
    },
    {
      name: t("herbalistSidebar.orders"),
      href: "/herbalist/dashboard/orders",
      icon: <MdShoppingCart className="w-5 h-5" />,
      badge: Number.isFinite(ordersCount) ? String(ordersCount) : null,
    },
    {
      name: t("herbalistSidebar.profile"),
      href: "/herbalist/dashboard/profile",
      icon: <MdPerson className="w-5 h-5" />,
    },
    {
      name: t("herbalistSidebar.settings"),
      href: "/herbalist/dashboard/settings",
      icon: <MdSettings className="w-5 h-5" />,
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
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems[item.name];
          const isActive =
            item.href === "/herbalist/dashboard"
              ? currentPath === "/herbalist/dashboard" ||
                currentPath === "/herbalist/dashboard/"
              : currentPath.startsWith(item.href);

          return (
            <div key={item.name} className="flex flex-col">
              <div className="flex items-center">
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ms-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
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
                    const isChildActive = currentPath === child.href;
                    return (
                      <a
                        key={child.name}
                        href={child.href}
                        onClick={(e) => handleClick(e, child.href)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isChildActive
                            ? "text-primary bg-primary/5"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {child.icon &&
                          React.cloneElement(child.icon, {
                            className: "w-4 h-4",
                          })}
                        <span>{child.name}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
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
