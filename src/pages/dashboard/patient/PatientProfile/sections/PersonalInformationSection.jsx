import { FaUser } from "react-icons/fa";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function PersonalInformationSection({ user }) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
          <FaUser className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Your primary account details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
            Full Name
          </label>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
            {user?.fullName || user?.name || "N/A"}
          </div>
        </div>
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
            Email Address
          </label>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
            {user?.email || "N/A"}
          </div>
        </div>
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
            Username
          </label>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
            {user?.userName || user?.username || "N/A"}
          </div>
        </div>
        <div className="group">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
            Phone Number
          </label>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 font-medium group-hover:bg-white group-hover:border-slate-300 transition-all">
            {user?.phone || "N/A"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PersonalInformationSection;
