import { FiEdit3, FiEye, FiTrash2 } from "react-icons/fi";
import {
  getUserInitials,
  getUserRoleTone,
} from "@features/admin/services/adminUsers";

function AdminUsersTable({ users, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Registry</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing all system users returned by the live API.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {users.length} entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Full Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Contact Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-slate-50/60"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                      {getUserInitials(user)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {user.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.userName || "No username"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getUserRoleTone(user.role)}`}
                  >
                    {user.role || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {user.email || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.phone || "No phone number"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(user)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                      aria-label={`View ${user.fullName || "user"}`}
                    >
                      <FiEye />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
                      aria-label={`Edit ${user.fullName || "user"}`}
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100"
                      aria-label={`Delete ${user.fullName || "user"}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersTable;
