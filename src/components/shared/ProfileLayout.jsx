import React from "react";

import { HiRefresh } from "react-icons/hi";


function ProfileLayout({
  title,
  subtitle,
  saving,
  onSubmit,
  children,
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-slate-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit}>
            {children}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
              >
                {saving ? (
                  <HiRefresh className="animate-spin" />
                ) : null}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileLayout;

