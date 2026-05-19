function PatientDashboardState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default PatientDashboardState;
