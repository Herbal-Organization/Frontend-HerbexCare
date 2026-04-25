import {
  FaSpa,
  FaShoppingBag,
  FaShoppingCart,
  FaBookOpen,
  FaUser,
  FaLeaf,
  FaSignOutAlt,
  FaHome,
  FaReceipt,
  FaBrain,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function PatientSidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = user?.email || "Patient";

  const navigation = [
    { name: "Dashboard", href: "/patient/dashboard", icon: FaSpa },
    { name: "My Cart", href: "/patient/dashboard/cart", icon: FaShoppingCart },
    {
      name: "My Orders",
      href: "/patient/dashboard/orders",
      icon: FaShoppingBag,
    },
    {
      name: "Saved Recipes",
      href: "/patient/dashboard/recipes",
      icon: FaBookOpen,
    },
    {
      name: "AI Consultation",
      href: "/patient/dashboard/ai-consultation",
      icon: FaBrain,
    },
    {
      name: "Herb Library",
      href: "/patient/home/herbs",
      icon: FaLeaf,
    },
    {
      name: "Recipe Library",
      href: "/patient/home/recipes",
      icon: FaReceipt,
    },
    {
      name: "Profile",
      href: "/patient/dashboard/profile",
      icon: FaUser,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
          <FaSpa className="text-2xl" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg leading-none">
            HerbexCare.AI
          </h1>
          <p className="text-primary text-xs font-medium mt-1">
            Your Wellness Partner
          </p>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors cursor-pointer ${
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
          <div className="mb-4 space-y-2">
            <button
              type="button"
              onClick={() => navigate("/patient/home")}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <FaHome className="text-primary" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 cursor-pointer"
            >
              <FaSignOutAlt className="text-xs" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">
                {user.role || "Member"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default PatientSidebar;
