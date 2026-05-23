function AdminUsersStats({ stats }) {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      accent: "bg-blue-50 text-blue-600",
      icon: "👥",
    },
    {
      label: "Active Herbalists",
      value: stats.activeHerbalists,
      accent: "bg-emerald-50 text-emerald-600",
      icon: "🌿",
    },
    {
      label: "New Patients",
      value: stats.newPatients,
      accent: "bg-rose-50 text-rose-600",
      icon: "🩺",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
              <span className="text-xl leading-none">{card.icon}</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{card.value}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default AdminUsersStats;
