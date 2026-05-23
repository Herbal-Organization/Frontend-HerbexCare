import { FiFilter } from "react-icons/fi";

function AdminUsersToolbar({
  roleFilter,
  onRoleFilterChange,
  totalItems,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
          <FiFilter />
          <span>{totalItems} total</span>
        </div>

        <select
          value={roleFilter}
          onChange={(event) => onRoleFilterChange(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-emerald-500"
        >
          <option value="All">All Roles</option>
          <option value="Patient">Patient</option>
          <option value="Herbalist">Herbalist</option>
          <option value="SuperAdmin">Super Admin</option>
        </select>
      </div>
    </div>
  );
}

export default AdminUsersToolbar;
