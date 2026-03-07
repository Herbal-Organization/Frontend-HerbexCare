import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
          <span className="material-symbols-outlined text-2xl">eco</span>
        </div>
        <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
          Herbal Care AI
        </h2>
      </Link>
      <div className="hidden md:flex flex-1 justify-end items-center gap-8">
        <nav className="flex items-center gap-8">
          <Link
            className="text-slate-600 hover:text-primary transition-colors text-sm font-bold"
            to="/auth"
          >
            Login/Register
          </Link>
        </nav>
        <Link to="/auth" className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/40 transition-all">
          <span>Get Started</span>
        </Link>
      </div>
      <button className="md:hidden flex items-center justify-center text-slate-900">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </>
  );
}

export default Navbar;
