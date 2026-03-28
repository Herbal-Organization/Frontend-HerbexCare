import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaBell, FaUserCircle } from "react-icons/fa";

function BrowseHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                <FaLeaf className="text-xl" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900  leading-none">
                Herbal Care AI
              </h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-primary text-sm font-semibold">
                Recipes
              </span>
              <Link
                className="text-slate-600 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
                to="/consult"
              >
                Consult
              </Link>
              <Link
                className="text-slate-600 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
                to="/care"
              >
                My Care
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <FaBell className="text-lg" />
            </button>
            <Link to="/patient/dashboard/profile" className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
              <FaUserCircle className="text-primary text-2xl" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default BrowseHeader;

