import { Link } from "react-router-dom";
import {
  FaBookMedical,
  FaCartPlus,
  FaClipboardCheck,
  FaBrain,
  FaLeaf,
  FaUsers,
  FaCommentDots,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import PatientNavbar from "@components/features/browse/PatientNavbar";
import Footer from "@components/features/landing/Footer";
import { getUserFromToken } from "@utils/auth";

function PatientHome() {
  const { t } = useTranslation();
  const user = getUserFromToken();

  const facilities = [
    {
      key: "aiConsultation",
      to: "/patient/dashboard/ai-consultation",
      icon: FaBrain,
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
    {
      key: "browseHerbs",
      to: "/patient/home/herbs",
      icon: FaLeaf,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      key: "browseRecipes",
      to: "/patient/home/recipes",
      icon: FaBookMedical,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      key: "myCart",
      to: "/patient/dashboard/cart",
      icon: FaCartPlus,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "myProfile",
      to: "/patient/dashboard/profile",
      icon: FaClipboardCheck,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      key: "herbalists",
      to: "/patient/home/herbalists",
      icon: FaUsers,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      key: "feedbacks",
      to: "/patient/dashboard/feedbacks",
      icon: FaCommentDots,
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PatientNavbar />
      <main className="flex-1">
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-emerald-50 via-white to-sky-50 px-6 py-10 sm:px-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <FaLeaf />
                {t("patientHome.badge")}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t("patientHome.welcome", {
                  name: user?.name || t("patientHome.patient"),
                })}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {t("patientHome.description")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/patient/dashboard"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                >
                  {t("patientHome.openDashboard")}
                </Link>
                <Link
                  to="/patient/home/herbs"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {t("patientHome.browseHerbs")}
                </Link>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  {t("patientHome.quickAccess.title")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("patientHome.quickAccess.description")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {facilities.map((facility) => {
                  const IconComponent = facility.icon;

                  return (
                    <Link
                      key={facility.to}
                      to={facility.to}
                      className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${facility.color}`}
                    >
                      <IconComponent className="text-2xl" />
                      <h3 className="mt-4 text-base font-bold text-slate-900">
                        {t(`patientHome.facilities.${facility.key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {t(
                          `patientHome.facilities.${facility.key}.description`,
                        )}
                      </p>
                      <span className="mt-4 inline-flex text-sm font-semibold">
                        {t(`patientHome.facilities.${facility.key}.cta`)} →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default PatientHome;
