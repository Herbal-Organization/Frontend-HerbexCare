function PatientSummaryCard({ eyebrow, title, value, caption, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    sky: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
  };

  return (
    <article className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </article>
  );
}

export default PatientSummaryCard;
