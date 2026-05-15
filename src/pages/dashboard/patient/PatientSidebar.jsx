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
  FaComments,
  FaCog,
  FaTimes,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function PatientSidebar({ user, onLogout, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const displayName = user?.email || t("patientSidebar.patient");

  const navigation = [
    {
      name: t("patientSidebar.dashboard"),
      href: "/patient/dashboard",
      icon: FaSpa,
    },
    {
      name: t("patientSidebar.myCart"),
      href: "/patient/dashboard/cart",
      icon: FaShoppingCart,
    },
    {
      name: t("patientSidebar.myOrders"),
      href: "/patient/dashboard/orders",
      icon: FaShoppingBag,
    },
    {
      name: t("patientSidebar.savedRecipes"),
      href: "/patient/dashboard/recipes",
      icon: FaBookOpen,
    },
    {
      name: t("patientSidebar.aiConsultation"),
      href: "/patient/dashboard/ai-consultation",
      icon: FaBrain,
    },
    {
      name: "AI Chat", // Or t("patientSidebar.aiChat") if translations were added
      href: "/patient/dashboard/ai-chat",
      icon: FaComments,
    },
    {
      name: t("patientSidebar.herbLibrary"),
      href: "/patient/home/herbs",
      icon: FaLeaf,
    },
    {
      name: t("patientSidebar.recipeLibrary"),
      href: "/patient/home/recipes",
      icon: FaReceipt,
    },
    {
      name: t("patientSidebar.profile"),
      href: "/patient/dashboard/profile",
      icon: FaUser,
    },
    {
      name: t("patientSidebar.settings"),
      href: "/patient/dashboard/settings",
      icon: FaCog,
    },
  ];

  const handleNavClick = (href) => {
    navigate(href);
    if (onClose) onClose();
  };

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
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
            <FaSpa className="text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-slate-900 font-bold text-lg leading-none">
              {t("patientSidebar.brand")}
            </h1>
            <p className="text-primary text-xs font-medium mt-1">
              {t("patientSidebar.tagline")}
            </p>
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isCurrent =
              item.href === "/patient/dashboard"
                ? location.pathname === "/patient/dashboard"
                : location.pathname.startsWith(item.href);

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start text-sm font-semibold transition-colors cursor-pointer ${
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
                onClick={() => handleNavClick("/patient/home")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-start text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
              >
                <FaHome className="text-primary" />
                <span>{t("patientSidebar.home")}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-300"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>{t("patientSidebar.signOut")}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">
                  {user.role || t("patientSidebar.member")}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default PatientSidebar;
