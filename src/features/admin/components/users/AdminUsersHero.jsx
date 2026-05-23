import { FiPlus, FiUsers } from "react-icons/fi";

function AdminUsersHero({ onAddUser, totalUsers }) {
  return (
    <section className="overflow-hidden rounded-4xl border border-emerald-950/10 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-6 py-8 text-white shadow-xl shadow-emerald-950/10 md:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-200">
            Platform Management
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
            User Management
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80 md:text-base">
            Administer all platform participants, including certified herbalists
            and patients. Review registry logs, manage credentials, and update
            access permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/10 transition-transform hover:-translate-y-0.5 hover:bg-emerald-200"
        >
          <FiPlus className="text-base" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-100">
        <FiUsers />
        <span>{totalUsers} total users</span>
      </div>
    </section>
  );
}

export default AdminUsersHero;
