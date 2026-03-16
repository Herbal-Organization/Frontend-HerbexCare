import React from "react";
import { MdAddCircleOutline, MdArrowForward, MdSmartToy } from "react-icons/md";

function QuickActions() {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg px-2">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4">
        <button className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:bg-slate-50 transition-all text-left group">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
            <MdAddCircleOutline className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Create New Recipe</p>
            <p className="text-xs text-slate-500">
              Design a custom blend for a patient
            </p>
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:bg-slate-50 transition-all text-left group">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
            <MdArrowForward className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Add New Herb</p>
            <p className="text-xs text-slate-500">
              Update your botanical inventory
            </p>
          </div>
        </button>

        <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="font-bold text-lg leading-tight">AI Analysis Ready</h4>
            <p className="text-sm mt-2">
              New research available for Astragalus Root effectiveness in immune
              health.
            </p>
            <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100">
              Read Summary
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
            <MdSmartToy className="text-[120px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickActions;

