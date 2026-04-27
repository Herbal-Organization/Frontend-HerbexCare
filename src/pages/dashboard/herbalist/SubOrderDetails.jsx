import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function SubOrderDetails() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/herbalist/dashboard/orders")}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
        This details view has been cleared to allow reimplementation.
      </div>
    </div>
  );
}

export default SubOrderDetails;
