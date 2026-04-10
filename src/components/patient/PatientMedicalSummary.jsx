import { getActiveConditions } from "../../services/patientProfile";
import { motion } from "motion/react";
import { FaHeartbeat } from "react-icons/fa";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

function PatientMedicalSummary({ profile }) {
  const activeConditions = getActiveConditions(profile);

  return (
    <motion.section 
      variants={itemVariants}
      className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
        <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
          <FaHeartbeat className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Medical History</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Conditions securely saved in your health profile
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Active Conditions
          </p>
          
          {activeConditions.length ? (
            <div className="flex flex-wrap gap-3">
              {activeConditions.map((condition) => (
                <span
                  key={condition}
                  className="rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm"
                >
                  {condition}
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
              <FaHeartbeat className="mx-auto text-3xl text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">No Active Conditions</p>
              <p className="text-xs text-slate-500 mt-1">You haven't marked any medical flags.</p>
            </div>
          )}
        </div>

        <div className="mt-auto rounded-2xl bg-slate-50 p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Additional Notes
            </p>
            {profile?.otherNotes && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
            {profile?.otherNotes || "No additional medical notes or allergies documented in your profile yet."}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

export default PatientMedicalSummary;
