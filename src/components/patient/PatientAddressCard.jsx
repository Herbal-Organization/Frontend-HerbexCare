import { FaCity, FaMapMarkedAlt, FaMapMarkerAlt, FaRoad } from "react-icons/fa";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

function AddressRow({ icon, label, value }) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
      <div className="mt-0.5 rounded-xl bg-white p-2.5 text-slate-400 shadow-sm group-hover:text-primary group-hover:scale-110 transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
          {label}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800">
          {value || "Not set"}
        </p>
      </div>
    </div>
  );
}

function PatientAddressCard({ profile }) {
  return (
    <motion.section 
      variants={itemVariants}
      className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
        <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
          <FaMapMarkedAlt className="text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Address Details</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Your primary location configuration
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <AddressRow
          icon={<FaMapMarkerAlt className="text-lg" />}
          label="Governorate"
          value={profile?.governorate}
        />
        <AddressRow 
          icon={<FaCity className="text-lg" />} 
          label="City" 
          value={profile?.city} 
        />
        <AddressRow 
          icon={<FaRoad className="text-lg" />} 
          label="Street Name / Number" 
          value={profile?.street} 
        />
      </div>
    </motion.section>
  );
}

export default PatientAddressCard;
