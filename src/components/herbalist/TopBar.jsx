import React from "react";
import { MdSearch, MdNotificationsNone, MdAdd } from "react-icons/md";

function TopBar({ onNewConsult }) {
  const handleNewConsult = () => {
    if (onNewConsult) {
      onNewConsult();
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search patients, herbs, recipes..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <MdNotificationsNone className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button
          type="button"
          onClick={handleNewConsult}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm shadow-primary/20"
        >
          <MdAdd className="w-4 h-4" />
          New Consult
        </button>
      </div>
    </header>
  );
}

export default TopBar;

