import { FaHeartbeat, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

function PatientOverviewHero({ user, profile }) {
  const address = [profile?.street, profile?.city, profile?.governorate]
    .filter(Boolean)
    .join(", ");
  const displayName = user?.fullName || user?.name || user?.userName || "";

  return (
    <motion.section 
      variants={itemVariants}
      className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Decorative gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-[80px]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary mb-2">
            Patient Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-5xl leading-tight">
            {`Welcome back${displayName ? `, ${displayName}` : ""}`}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 font-medium">
            Keep your profile, address, and medical history up to date so your
            herbal care plan stays perfectly tailored to you.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:flex flex-wrap gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 truncate">
                {user?.email || "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {user?.phone || "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Birth Date
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {profile?.birthDate
                  ? new Date(profile.birthDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric'})
                  : "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-md hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Gender
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {profile?.gender || "Not set"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 content-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-8">
          <div className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3.5 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                <FaMapMarkerAlt className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Primary Location
                </p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {address || "Update in your profile"}
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-amber-50 p-3.5 text-amber-600 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                <FaHeartbeat className="text-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    Medical Profile
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Syncing from your health records
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-10">
              <FaShieldAlt className="text-8xl text-emerald-400" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="rounded-2xl bg-white/10 p-3.5 text-emerald-400 backdrop-blur">
                <FaShieldAlt className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">Secure Data Sync</p>
                <p className="text-sm text-slate-400 font-medium mt-0.5">
                  End-to-end protected by Herbal AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default PatientOverviewHero;
