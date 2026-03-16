import React from "react";
import { FaSpa, FaShoppingBag, FaBookOpen, FaUser, FaCog } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function PatientSidebar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/patient/dashboard", icon: FaSpa },
    { name: "My Orders", href: "/patient/dashboard/orders", icon: FaShoppingBag },
    { name: "Saved Recipes", href: "/patient/dashboard/recipes", icon: FaBookOpen },
    { name: "Profile", href: "/patient/dashboard/profile", icon: FaUser },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
          <FaSpa className="text-2xl" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg leading-none">Herbal Care AI</h1>
          <p className="text-primary text-xs font-medium mt-1">Your Wellness Partner</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isCurrent =
            item.href === "/patient/dashboard"
              ? location.pathname === "/patient/dashboard"
              : location.pathname.startsWith(item.href);

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                isCurrent
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="text-base" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name || "Patient"}</p>
              <p className="text-xs text-slate-500 truncate">{user.role || "Member"}</p>
            </div>
            <FaCog className="text-slate-400 text-lg" />
          </div>
        </div>
      )}
    </aside>
  );
}

export default PatientSidebar;

