import { Link } from "react-router-dom";
import {
  FaBookMedical,
  FaCartPlus,
  FaClipboardCheck,
  FaBrain,
  FaLeaf,
} from "react-icons/fa";
import PatientNavbar from "../../../components/browse/PatientNavbar";
import Footer from "../../../components/landing/Footer";
import { getUserFromToken } from "../../../utils/auth";

function PatientHome() {
  const user = getUserFromToken();

  const facilities = [
    {
      title: "AI Consultation",
      description: "Start a quick symptom-based AI consultation.",
      cta: "Start Now",
      to: "/patient/dashboard/ai-consultation",
      icon: FaBrain,
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
    {
      title: "Browse Herbs",
      description: "Explore medicinal herbs and their benefits.",
      cta: "Open Herbs",
      to: "/patient/home/herbs",
      icon: FaLeaf,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Browse Recipes",
      description: "See herbal recipes and treatment plans.",
      cta: "Open Recipes",
      to: "/patient/home/recipes",
      icon: FaBookMedical,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "My Cart",
      description: "Check items before placing an order.",
      cta: "Open Cart",
      to: "/patient/dashboard/cart",
      icon: FaCartPlus,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "My Profile",
      description: "Update personal and medical details.",
      cta: "Open Profile",
      to: "/patient/dashboard/profile",
      icon: FaClipboardCheck,
      color: "bg-purple-50 text-purple-700 border-purple-200",
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
                Patient Home
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, {user?.name || "Patient"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                This is your main place to reach the most important parts of the
                system quickly.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/patient/dashboard"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                >
                  Open Dashboard
                </Link>
                <Link
                  to="/patient/home/herbs"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Browse Herbs
                </Link>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Quick Access
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Only the main actions you need every day.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                        {facility.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {facility.description}
                      </p>
                      <span className="mt-4 inline-flex text-sm font-semibold">
                        {facility.cta} →
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
