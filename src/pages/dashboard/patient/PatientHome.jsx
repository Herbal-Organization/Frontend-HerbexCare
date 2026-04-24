import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "motion/react";
import {
  FaBookMedical,
  FaClipboardCheck,
  FaFlask,
  FaHeartbeat,
  FaLeaf,
  FaNotesMedical,
  FaUserMd,
} from "react-icons/fa";
import PatientNavbar from "../../../components/browse/PatientNavbar";
import RecipesGrid from "../../../components/browse/RecipesGrid";
import Footer from "../../../components/landing/Footer";
import useRecipes from "../../../hooks/useRecipes";

const HERO_BACKGROUND_IMAGE =
  "https://plus.unsplash.com/premium_photo-1663036948705-7dee4d33c07a?w=1600&auto=format&fit=crop&q=80";

function PatientHome() {
  const { recipes, isLoading, error, reload } = useRecipes();

  const featuredRecipes = useMemo(() => recipes.slice(0, 4), [recipes]);

  const facilities = [
    {
      title: "Herb Knowledge Base",
      description:
        "Review herbs, indications, precautions, and approved natural options.",
      cta: "Open Herb Library",
      to: "/patient/home/herbs",
      icon: FaLeaf,
      tone: "from-emerald-500 to-teal-500",
    },
    {
      title: "Recipe Treatment Plans",
      description:
        "Browse herbal recipes and symptom-based formulas for daily care.",
      cta: "Browse Recipes",
      to: "/patient/home/recipes",
      icon: FaBookMedical,
      tone: "from-cyan-500 to-blue-500",
    },
    {
      title: "Patient Dashboard",
      description:
        "View your medical summary, profile data, and wellness overview.",
      cta: "Go To Dashboard",
      to: "/patient/dashboard",
      icon: FaHeartbeat,
      tone: "from-rose-500 to-orange-500",
    },
    {
      title: "Profile & Medical Record",
      description:
        "Update your personal profile, contact details, and care information.",
      cta: "Manage Profile",
      to: "/patient/dashboard/profile",
      icon: FaClipboardCheck,
      tone: "from-violet-500 to-fuchsia-500",
    },
  ];

  const systemHighlights = [
    {
      title: "Evidence-Informed",
      description:
        "Recommendations are organized to support safer daily herbal choices.",
      icon: FaFlask,
    },
    {
      title: "Clinical Readability",
      description:
        "Medical-style labels make guidance easier to scan and follow quickly.",
      icon: FaNotesMedical,
    },
    {
      title: "Care Team Ready",
      description:
        "Keep your data and plan organized for discussions with professionals.",
      icon: FaUserMd,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PatientNavbar />
      <main className="flex-1">
        <section
          className="relative overflow-hidden border-b border-slate-200 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(248, 250, 252, 0.6), rgba(248, 250, 252, 0.6), rgba(236, 253, 245, 0.6)), url(${HERO_BACKGROUND_IMAGE})`,
          }}
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <FaHeartbeat />
                Patient Care Home
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Your Medical Herbal System Dashboard
              </h1>
              <p className="mt-5 max-w-3xl text-base sm:text-lg font-medium leading-relaxed text-slate-700">
                Access all patient facilities from one place: herbal knowledge,
                treatment recipes, personal profile updates, and your health
                overview.
              </p>
            </Motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-3xl">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Recipes
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {recipes.length}
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient Modules
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {facilities.length}
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  System Status
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-700">
                  Ready
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Patient Facilities
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Choose what you want to do in the system.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {facilities.map((facility, index) => (
              <Motion.div
                key={facility.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="h-full"
              >
                <Link
                  to={facility.to}
                  className="group flex h-full flex-col rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-md ${facility.tone}`}
                  >
                    <facility.icon className="text-lg" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    {facility.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed font-medium text-slate-600 flex-1">
                    {facility.description}
                  </p>
                  <span className="mt-6 text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                    {facility.cta}
                  </span>
                </Link>
              </Motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Why This Patient Home Works
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {systemHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <item.icon />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex items-end justify-between pb-7">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Recommended Recipes
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Quick access to recipes for your daily care plan.
              </p>
            </div>
            <Link
              to="/patient/home/recipes"
              className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              View all recipes
            </Link>
          </div>

          <RecipesGrid
            recipes={featuredRecipes}
            isLoading={isLoading}
            error={error}
            onRetry={reload}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default PatientHome;
