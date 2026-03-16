import React from "react";
import {
  MdGroup,
  MdTrendingUp,
  MdDescription,
  MdLocalShipping,
} from "react-icons/md";

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <MdGroup className="w-6 h-6" />
          </div>
          <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
            <MdTrendingUp className="w-4 h-4" />
            5.2%
          </span>
        </div>
        <p className="text-slate-500 text-sm">Total Patients</p>
        <h3 className="text-2xl font-bold mt-1">1,284</h3>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <MdDescription className="w-6 h-6" />
          </div>
          <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
            <MdTrendingUp className="w-4 h-4" />
            2.1%
          </span>
        </div>
        <p className="text-slate-500 text-sm">Active Recipes</p>
        <h3 className="text-2xl font-bold mt-1">86</h3>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <MdLocalShipping className="w-6 h-6" />
          </div>
          <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
            <MdTrendingUp className="w-4 h-4" />
            14%
          </span>
        </div>
        <p className="text-slate-500 text-sm">New Orders</p>
        <h3 className="text-2xl font-bold mt-1">12</h3>
      </div>
    </div>
  );
}

export default StatsGrid;

