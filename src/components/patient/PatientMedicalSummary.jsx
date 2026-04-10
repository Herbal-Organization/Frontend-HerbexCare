import { getActiveConditions } from "../../services/patientProfile";

function PatientMedicalSummary({ profile }) {
  const activeConditions = getActiveConditions(profile);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medical History</h2>
          <p className="mt-1 text-sm text-slate-500">
            A quick snapshot of the conditions stored in your profile.
          </p>
        </div>
      </div>

      {activeConditions.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {activeConditions.map((condition) => (
            <span
              key={condition}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              {condition}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          No active conditions have been saved yet.
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Notes
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {profile?.otherNotes || "No additional medical notes saved yet."}
        </p>
      </div>
    </section>
  );
}

export default PatientMedicalSummary;
