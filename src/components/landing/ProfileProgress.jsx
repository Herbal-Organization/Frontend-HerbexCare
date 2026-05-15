import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProfileCompletionPercentage } from "../../services/patientProfile";

function ProfileProgress() {
  const { t } = useTranslation();
  const [percent, setPercent] = useState(() => getProfileCompletionPercentage());

  useEffect(() => {
    const update = () => setPercent(getProfileCompletionPercentage());
    // Update when other tabs change localStorage
    window.addEventListener("storage", update);
    // Also poll every 2s to catch same-tab changes (simple and reliable)
    const id = setInterval(update, 2000);
    return () => {
      window.removeEventListener("storage", update);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="w-56">
      <p className="text-xs font-semibold text-slate-500">{t("hero.profileProgress.title")}</p>
      <p className="text-sm font-bold text-slate-900">{t("hero.profileProgress.subtitle", { percent })}</p>
      <div className="mt-3 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProfileProgress;
