import { FiBell, FiGrid, FiSearch } from "react-icons/fi";

function AdminUsersHeader({ searchValue, onSearchChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <FiSearch className="text-emerald-700" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search system records..."
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      <button
        type="button"
        className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:inline-flex"
        aria-label="Notifications"
      >
        <FiBell />
      </button>

      <button
        type="button"
        className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:inline-flex"
        aria-label="Applications"
      >
        <FiGrid />
      </button>

      <div className="hidden h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500 bg-emerald-50 text-sm font-black text-emerald-700 shadow-sm lg:flex">
        SA
      </div>
    </div>
  );
}

export default AdminUsersHeader;
