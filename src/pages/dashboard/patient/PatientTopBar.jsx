import React from "react";
import { FaSearch, FaBell, FaCalendarAlt } from "react-icons/fa";

function PatientTopBar() {
  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search remedies, herbs, or recipes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600"
        >
          <FaBell className="text-base" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
        >
          <FaCalendarAlt className="text-base" />
        </button>
      </div>
    </header>
  );
}

export default PatientTopBar;

