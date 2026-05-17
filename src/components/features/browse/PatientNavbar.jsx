import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLeaf,
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShoppingCart,
  FaHome,
  FaBookOpen,
  FaUser
} from "react-icons/fa";
import { getUserFromToken, logout } from "@utils/auth";
import { useCart } from "@context/CartContext";
import { useTranslation } from "react-i18next";

function PatientNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const user = getUserFromToken();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t("navbar.home"), path: "/patient/home", exact: true, icon: FaHome },
    { label: t("navbar.herbs"), path: "/patient/home/herbs", icon: FaLeaf },
    { label: t("navbar.recipes"), path: "/patient/home/recipes", icon: FaBookOpen },
    { label: t("navbar.profile"), path: "/patient/dashboard/profile", icon: FaUser },
  ];

  const isActive = ({ path, exact }) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)] py-2" 
          : "bg-white/50 backdrop-blur-md border-b border-primary/10 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo Section */}
          <Link
            to="/patient/home"
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-white shadow-md shadow-emerald-200 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center">
              <FaLeaf className="text-xl drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent transition-all duration-300">
              {t("navbar.brand")}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 px-2 py-1 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group flex items-center gap-2 ${
                    active
                      ? "text-emerald-700 bg-emerald-100/50 shadow-sm"
                      : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                  }`}
                >
                  <Icon className={`text-base transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Underline for active state */}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-full" />
                  )}
                  {/* Hover underline effect */}
                  {!active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-emerald-300/50 rounded-t-full transition-all duration-300 group-hover:w-4/5" />
                  )}
                  
                  {/* Hover effect background */}
                  <span className="absolute inset-0 bg-emerald-100/0 group-hover:bg-emerald-100/30 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl origin-center" />
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              to="/patient/dashboard/cart"
              className="relative p-2.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all duration-300 hover:shadow-sm transform hover:-translate-y-0.5 group"
            >
              <FaShoppingCart className="text-lg group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-[11px] font-bold text-white shadow-md border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:shadow-sm transform hover:-translate-y-0.5 hidden sm:block group">
              <FaBell className="text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
            </button>

            {/* User Profile Section */}
            <div className="hidden sm:flex items-center gap-3 ps-4 ms-2 border-s border-slate-200">
              <div className="text-end">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {user?.name || t("navbar.user")}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {user?.email || t("navbar.user")}
                </p>
              </div>
              <Link
                to="/patient/dashboard/profile"
                className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border-2 border-white shadow-sm shadow-emerald-100 overflow-hidden hover:shadow-md hover:border-emerald-100 transition-all duration-300 transform hover:scale-105 group"
              >
                <FaUserCircle className="text-emerald-500 text-2xl group-hover:text-emerald-600 transition-colors" />
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 ms-2 rounded-xl text-sm font-bold text-rose-500 bg-rose-50 hover:text-white hover:bg-rose-500 hover:shadow-md hover:shadow-rose-200 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FaSignOutAlt className="text-lg" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
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
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100 mt-4 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-100">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 ${
                    active
                      ? "text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-100/50"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50"
                  }`}
                >
                  <Icon className={`text-lg ${active ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"}`} />
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-slate-100 my-1"></div>
            <Link
              to="/patient/dashboard/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaShoppingCart className="text-lg text-emerald-500" />
                <span>{t("navbar.myCart")}</span>
              </div>
              {cartCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 mt-1 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors text-start"
            >
              <FaSignOutAlt className="text-lg text-rose-400" />
              <span>{t("navbar.logout")}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default PatientNavbar;

