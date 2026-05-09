import { FaVenusMars, FaBirthdayCake } from "react-icons/fa";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function PatientDetailsSection({ profile, updateField }) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
          <FaVenusMars className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Patient Details</h2>
          <p className="text-xs text-slate-500 font-medium">
            Demographic information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
            Birth Date
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
              <FaBirthdayCake />
            </div>
            <input
              type="date"
              name="birthDate"
              value={profile.birthDate}
              onChange={updateField}
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
            Gender
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
              <FaVenusMars />
            </div>
            <select
              name="gender"
              value={profile.gender}
              onChange={updateField}
              className="block w-full appearance-none rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300 cursor-pointer"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PatientDetailsSection;
