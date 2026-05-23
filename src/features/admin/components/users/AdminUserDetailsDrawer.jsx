import { FiX } from "react-icons/fi";
import {
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaUser,
  FaMapMarkerAlt,
  FaUserTag,
} from "react-icons/fa";

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="text-slate-500" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

function AdminUserDetailsDrawer({ user, isOpen, onClose, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close user details"
      />

      <aside className="relative ms-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
              User Details
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              {user?.fullName || "User"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Live record fetched from the API.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Close details panel"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Full Name"
                  value={user?.fullName}
                  icon={FaUser}
                />
                <DetailRow
                  label="Username"
                  value={user?.userName}
                  icon={FaUserTag}
                />
                <DetailRow label="Role" value={user?.role} icon={FaShieldAlt} />
                <DetailRow
                  label="Email"
                  value={user?.email}
                  icon={FaEnvelope}
                />
                <DetailRow label="Phone" value={user?.phone} icon={FaPhone} />
                <DetailRow
                  label="Governorate"
                  value={user?.governorate}
                  icon={FaMapMarkerAlt}
                />
                <DetailRow
                  label="City"
                  value={user?.city}
                  icon={FaMapMarkerAlt}
                />
                <DetailRow
                  label="Street"
                  value={user?.street}
                  icon={FaMapMarkerAlt}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default AdminUserDetailsDrawer;
