import { FaCity, FaMapMarkerAlt, FaRoad } from "react-icons/fa";

function AddressRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {value || "Not set"}
        </p>
      </div>
    </div>
  );
}

function PatientAddressCard({ profile }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Address Details</h2>
      <p className="mt-1 text-sm text-slate-500">
        Your saved address is used across the patient dashboard.
      </p>

      <div className="mt-6 grid gap-4">
        <AddressRow
          icon={<FaMapMarkerAlt />}
          label="Governorate"
          value={profile?.governorate}
        />
        <AddressRow icon={<FaCity />} label="City" value={profile?.city} />
        <AddressRow icon={<FaRoad />} label="Street" value={profile?.street} />
      </div>
    </section>
  );
}

export default PatientAddressCard;
