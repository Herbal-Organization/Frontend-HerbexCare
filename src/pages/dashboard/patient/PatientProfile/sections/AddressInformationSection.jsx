import { FaMapMarkerAlt, FaCity, FaStreetView } from "react-icons/fa";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function AddressInformationSection({ profile, updateField }) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
          <FaMapMarkerAlt className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Address Information
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            To help us locate you for appointments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="group md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
            Governorate
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
              <FaMapMarkerAlt />
            </div>
            <input
              type="text"
              name="governorate"
              value={profile.governorate}
              onChange={updateField}
              placeholder="e.g. Cairo"
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
            />
          </div>
        </div>
        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
            City
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
              <FaCity />
            </div>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={updateField}
              placeholder="e.g. Nasr City"
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">
            Street Address
          </label>
          <div className="relative group-hover:shadow-sm transition-shadow rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
              <FaStreetView />
            </div>
            <input
              type="text"
              name="street"
              value={profile.street}
              onChange={updateField}
              placeholder="Enter street and building"
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm border font-medium transition-all hover:bg-white hover:border-slate-300"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AddressInformationSection;
