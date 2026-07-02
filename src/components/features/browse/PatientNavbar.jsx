import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLeaf,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShoppingCart,
  FaHome,
  FaBookOpen,
  FaUserMd,
  FaUserCircle,
  FaRobot,
  FaThLarge,
  FaBoxOpen,
  FaHeart,
  FaCog,
  FaUser,
  FaChevronDown,
} from "react-icons/fa";
import { getUserFromToken, logout } from "@utils/auth";
import { useCart } from "@context/CartContext";
import { useTranslation } from "react-i18next";

function PatientNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const user = getUserFromToken();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { t } = useTranslation();
  const accountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the account dropdown on outside click or Escape
  useEffect(() => {
    if (!isAccountOpen) return;
    const handlePointer = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setIsAccountOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isAccountOpen]);

  const navItems = [
    {
      label: t("navbar.home"),
      path: "/patient/home",
      exact: true,
      icon: FaHome,
    },
    { label: t("navbar.herbs"), path: "/patient/home/herbs", icon: FaLeaf },
    {
      label: t("navbar.recipes"),
      path: "/patient/home/recipes",
      icon: FaBookOpen,
    },
    {
      label: t("navbar.herbalists"),
      path: "/patient/home/herbalists",
      icon: FaUserMd,
    },
  ];

  const accountItems = [
    {
      label: t("navbar.dashboard"),
      path: "/patient/dashboard",
      exact: true,
      icon: FaThLarge,
    },
    {
      label: t("navbar.orders"),
      path: "/patient/dashboard/orders",
      icon: FaBoxOpen,
    },
    {
      label: t("navbar.favorites"),
      path: "/patient/dashboard/favorites",
      icon: FaHeart,
    },
    {
      label: t("navbar.profile"),
      path: "/patient/dashboard/profile",
      icon: FaUser,
    },
    {
      label: t("navbar.settings"),
      path: "/patient/dashboard/settings",
      icon: FaCog,
    },
  ];

  const isActive = ({ path, exact }) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const aiChatActive = location.pathname.startsWith(
    "/patient/dashboard/ai-chat",
  );

  return (
    <header
      className={`sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b transition-shadow duration-200 ${
        scrolled
          ? "border-slate-200/80 dark:border-slate-700/60 shadow-sm"
          : "border-slate-100 dark:border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            to="/patient/home"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors duration-200 group-hover:bg-emerald-700">
              <FaLeaf className="text-lg" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {t("navbar.brand")}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    active
                      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* AI Chat — highlighted flagship link */}
            <Link
              to="/patient/dashboard/ai-chat"
              aria-current={aiChatActive ? "page" : undefined}
              className={`flex items-center gap-2 px-3.5 py-2 ms-1 rounded-lg text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                aiChatActive
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              }`}
            >
              <FaRobot className="text-base" />
              <span>{t("navbar.aiChat")}</span>
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-1.5">
            {/* Cart Icon */}
            <Link
              to="/patient/dashboard/cart"
              aria-label={t("navbar.myCart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <FaShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -inset-e-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            <div className="hidden sm:block relative" ref={accountRef}>
              <button
                onClick={() => setIsAccountOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                aria-label={t("navbar.account")}
                className="flex items-center gap-2 ps-2 pe-1.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="text-end max-w-40">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {user?.name || t("navbar.user")}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || ""}
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/60">
                  <FaUserCircle className="text-emerald-600 dark:text-emerald-400 text-2xl" />
                </span>
                <FaChevronDown
                  className={`text-xs text-slate-400 transition-transform duration-200 ${isAccountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isAccountOpen && (
                <div
                  role="menu"
                  className="absolute end-0 mt-2 w-56 origin-top-end rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-lg py-1.5"
                >
                  {accountItems.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        role="menuitem"
                        onClick={() => setIsAccountOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                          active
                            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <Icon className="text-base text-slate-400 dark:text-slate-500" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="h-px bg-slate-100 dark:bg-slate-700/60 my-1.5" />

                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex items-center gap-3 w-full px-3 py-2.5 mx-1.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors duration-150 text-start"
                  >
                    <FaSignOutAlt className="text-base" />
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              aria-label={t("navbar.menu")}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-168 opacity-100 pb-4"
              : "max-h-0 opacity-0"
          }`}
        >
          {/* Mobile user summary */}
          <Link
            to="/patient/dashboard/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/60">
              <FaUserCircle className="text-emerald-600 dark:text-emerald-400 text-2xl" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || t("navbar.user")}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || ""}
              </p>
            </div>
          </Link>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon
                    className={`text-lg ${active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
                  />
                  {item.label}
                </Link>
              );
            })}

            {/* AI Chat — highlighted */}
            <Link
              to="/patient/dashboard/ai-chat"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={aiChatActive ? "page" : undefined}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors duration-150"
            >
              <FaRobot className="text-lg text-emerald-600 dark:text-emerald-400" />
              {t("navbar.aiChat")}
            </Link>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

            {/* Account links */}
            {accountItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon
                    className={`text-lg ${active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
                  />
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/patient/dashboard/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
            >
              <span className="flex items-center gap-3">
                <FaShoppingCart className="text-lg text-slate-400 dark:text-slate-500" />
                {t("navbar.myCart")}
              </span>
              {cartCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors duration-150 text-start"
            >
              <FaSignOutAlt className="text-lg" />
              <span>{t("navbar.logout")}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default PatientNavbar;
