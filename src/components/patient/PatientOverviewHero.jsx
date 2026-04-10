import { FaHeartbeat, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";

function PatientOverviewHero({ user, profile }) {
  const address = [profile?.street, profile?.city, profile?.governorate]
    .filter(Boolean)
    .join(", ");
  const displayName = user?.fullName || user?.name || user?.userName || "";

  return (
    <section className="overflow-hidden rounded-[32px] border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),linear-gradient(135deg,_#f7fff9_0%,_#eefbf5_45%,_#ffffff_100%)] p-8 shadow-sm">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
            Patient Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {`Welcome back${displayName ? `, ${displayName}` : ""}`}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Keep your profile, address, and medical history up to date so your
            herbal care plan stays accurate and personalized.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {user?.email || "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {user?.phone || "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Birth Date
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {profile?.birthDate
                  ? new Date(profile.birthDate).toLocaleDateString("en-US")
                  : "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gender
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {profile?.gender || "Not set"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Current Address
                </p>
                <p className="text-sm text-slate-500">
                  {address || "Add your address in the profile form"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <FaHeartbeat />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Medical History
                </p>
                <p className="text-sm text-slate-500">
                  Updated from your personal health profile
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-slate-900 p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
                <FaShieldAlt />
              </div>
              <div>
                <p className="text-sm font-semibold">Health data sync</p>
                <p className="text-sm text-slate-300">
                  Your saved profile is used to improve dashboard context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PatientOverviewHero;
