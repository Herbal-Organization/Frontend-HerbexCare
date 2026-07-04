const tones = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber:
    "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100",
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100",
  rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100",
  slate: "bg-slate-50 text-slate-700 border-slate-100",
};

function OrderStatsCard({ label, value, hint, icon, tone = "emerald" }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
          {hint && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          )}
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

export default OrderStatsCard;
