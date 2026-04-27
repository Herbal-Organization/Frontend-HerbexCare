import React from "react";
import { Link } from "react-router-dom";

function HerbalistSubOrders() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">Orders / Tasks</h2>
        <p className="mt-1 text-sm text-slate-500">
          This page has been cleared to allow reimplementation.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
        Orders have been removed. Reimplement this page as needed.
      </div>

      <div className="mt-4">
        <Link
          to="/herbalist/dashboard"
          className="text-sm font-bold text-slate-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default HerbalistSubOrders;
