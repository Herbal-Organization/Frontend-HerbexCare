import { motion } from "motion/react";
import { FaCamera } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function ProfilePhotoSection({ profile, setProfile, user }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center md:items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="relative">
        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 overflow-hidden flex items-center justify-center text-emerald-500 text-4xl font-bold shadow-inner ring-4 ring-white">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt="Profile photo"
              className="h-full w-full object-cover"
            />
          ) : (
            (user?.fullName || user?.name || "P").charAt(0).toUpperCase()
          )}
        </div>
        <label className="absolute bottom-0 end-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-primary cursor-pointer hover:scale-110 hover:bg-emerald-50 transition-transform">
          <FaCamera className="text-sm" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setProfile((prev) => ({ ...prev, photoUrl: url }));
            }}
          />
        </label>
      </div>
      <div className="flex-1 text-center md:text-start flex flex-col items-center md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t("profile.sections.photo.title")}</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {t("profile.sections.photo.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-sm font-semibold transition-colors cursor-pointer">
            {t("profile.sections.photo.change")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                setProfile((prev) => ({ ...prev, photoUrl: url }));
              }}
            />
          </label>
          {profile.photoUrl && (
            <button
              type="button"
              onClick={() => setProfile((prev) => ({ ...prev, photoUrl: "" }))}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
            >
              {t("profile.sections.photo.remove")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProfilePhotoSection;
