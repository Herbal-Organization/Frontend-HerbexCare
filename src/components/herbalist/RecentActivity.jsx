import React from "react";
import {
  MdAssignmentTurnedIn,
  MdEditNote,
  MdPersonAdd,
} from "react-icons/md";

function RecentActivity() {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-lg">Recent Activity</h3>
        <button className="text-primary text-sm font-medium hover:underline">
          View All
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <MdAssignmentTurnedIn className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              <span className="text-primary">Order #8429</span> was dispatched
              for <span className="font-bold">Michael Chen</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
          </div>
          <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            Shipped
          </span>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <MdEditNote className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              New recipe{" "}
              <span className="font-bold">"Digestive Soothe Tincture"</span>{" "}
              created
            </p>
            <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
          </div>
          <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            Recipe
          </span>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <MdPersonAdd className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              New patient{" "}
              <span className="font-bold">Elena Rodriguez</span> completed
              intake
            </p>
            <p className="text-xs text-slate-500 mt-1">Yesterday</p>
          </div>
          <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
            New Patient
          </span>
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;

