import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function RecipesPagination() {
  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200  text-slate-600 hover:bg-primary/10 hover:border-primary transition-all">
          <FiChevronLeft />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">
          1
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200  text-slate-600 hover:bg-primary/10 hover:border-primary transition-all">
          2
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-primary/10 hover:border-primary transition-all">
          3
        </button>
        <span className="px-2 text-slate-400">...</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-primary/10 hover:border-primary transition-all">
          12
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-primary/10 hover:border-primary transition-all">
          <FiChevronRight />
        </button>
      </nav>
    </div>
  );
}

export default RecipesPagination;

