import React from "react";

function UpcomingConsultations() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h4 className="font-bold text-sm mb-4">Upcoming Consultations</h4>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-center w-10 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Oct</p>
            <p className="text-lg font-bold leading-none">24</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="text-sm font-semibold">James Wilson</p>
            <p className="text-xs text-slate-500">10:30 AM - Online</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center w-10 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Oct</p>
            <p className="text-lg font-bold leading-none">24</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="text-sm font-semibold">Sarah Jenkins</p>
            <p className="text-xs text-slate-500">02:15 PM - Clinic</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpcomingConsultations;

