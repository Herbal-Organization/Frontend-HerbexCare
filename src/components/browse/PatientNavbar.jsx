import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLeaf,
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShoppingCart,
} from "react-icons/fa";
import { getUserFromToken, logout } from "../../utils/auth";
import { useCart } from "../../context/CartContext";

function PatientNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = getUserFromToken();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navItems = [
    { label: "Home", path: "/patient/home", exact: true },
    { label: "Herbs", path: "/patient/home/herbs" },
    { label: "Recipes", path: "/patient/home/recipes" },
    { label: "Profile", path: "/patient/dashboard/profile" },
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/patient/home"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
              <FaLeaf className="text-xl" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              Herbal Care AI
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item)
                    ? "text-primary bg-primary/10"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link
              to="/patient/dashboard/cart"
              className="relative p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-all"
            >
              <FaShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
              <FaBell className="text-lg" />
            </button>

            {/* User Profile Dropdown */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "Patient"}
                </p>
              </div>
              <Link
                to="/patient/dashboard/profile"
                className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden hover:bg-primary/30 transition-colors"
              >
                <FaUserCircle className="text-primary text-2xl" />
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-600 hover:text-primary"
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
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200">
            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item)
                      ? "text-primary bg-primary/10"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/patient/dashboard/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <FaShoppingCart className="text-lg" />
                <span>My Cart ({cartCount})</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <FaSignOutAlt className="text-lg" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default PatientNavbar;
