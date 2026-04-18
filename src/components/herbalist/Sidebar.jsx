import React from "react";
import {
  MdEco,
  MdDashboard,
  MdLocalFlorist,
  MdMenuBook,
  MdInventory,
  MdShoppingCart,
  MdPerson,
} from "react-icons/md";

function Sidebar({ currentPath, onNavigate, user, onLogout }) {
  const navigation = [
    { name: "Dashboard", href: "/herbalist/dashboard" },
    { name: "Manage Herbs", href: "/herbalist/dashboard/herbs" },
    { name: "Manage Recipes", href: "/herbalist/dashboard/recipes" },
    { name: "Inventory", href: "/herbalist/dashboard/inventory" },
    { name: "Orders", href: "/herbalist/dashboard/orders", badge: "12" },
    { name: "Profile", href: "/herbalist/dashboard/profile" },
  ];

  const handleClick = (event, href) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <aside className="w-72 flex flex-col bg-white border-r border-slate-200 shrink-0">
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
      <nav className="flex-1 px-4 space-y-1 mt-4">
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
              {item.name === "Dashboard" && <MdDashboard className="w-5 h-5" />}
              {item.name === "Manage Herbs" && (
                <MdLocalFlorist className="w-5 h-5" />
              )}
              {item.name === "Manage Recipes" && (
                <MdMenuBook className="w-5 h-5" />
              )}
              {item.name === "Inventory" && <MdInventory className="w-5 h-5" />}
              {item.name === "Orders" && <MdShoppingCart className="w-5 h-5" />}
              {item.name === "Profile" && <MdPerson className="w-5 h-5" />}
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
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
              {user?.role || "Practitioner"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto text-slate-400 hover:text-slate-600 text-xs font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
