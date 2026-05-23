import { useEffect, useMemo, useState } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  isAuthenticated,
  getUserFromToken,
  getUserRole,
  logout,
} from "@utils/auth";
import DashboardLayout from "@components/layouts/DashboardLayout";
import { getAdminNavConfig } from "@config/dashboard/adminNav";
import { getAllUsers } from "@api/users";
import { getAllPatients } from "@api/patients";
import { getAllHerbalists } from "@api/herbalists";
import AdminUsersPage from "./AdminUsersPage";
import {
  FaDatabase,
  FaExternalLinkAlt,
  FaLeaf,
  FaUser,
  FaUsers,
} from "react-icons/fa";

const SWAGGER_URL =
  "https://herbal-api-v1-geg9dub2brgee4ag.austriaeast-01.azurewebsites.net/swagger/index.html";

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const pick = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeUser = (raw = {}) => ({
  id: pick(raw.id, raw.userId, raw.userID),
  fullName: pick(raw.fullName, raw.name, raw.userName, raw.username),
  email: pick(raw.email, raw.mail),
  phone: pick(raw.phone, raw.phoneNumber),
  role: pick(raw.role, raw.userRole, raw.accountType, raw.type),
});

const normalizePatient = (raw = {}) => ({
  id: pick(raw.id, raw.patientId, raw.userId),
  fullName: pick(raw.fullName, raw.name, raw.userName, raw.username),
  email: pick(raw.email, raw.mail),
  birthDate: pick(raw.birthDate, raw.dateOfBirth),
  gender: pick(raw.genderName, raw.gender),
  age: pick(raw.age),
});

const normalizeHerbalist = (raw = {}) => ({
  id: pick(raw.id, raw.herbalistId, raw.userId),
  fullName: pick(raw.fullName, raw.name, raw.userName, raw.username),
  email: pick(raw.email, raw.mail),
  licenseNumber: pick(raw.licenseNumber),
  bio: pick(raw.bio),
  rating: pick(raw.averageRating),
});

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ id, title, description, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PeopleGrid({ items, emptyMessage, renderBadge, renderSecondary }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item, index) => (
        <article
          key={`${item.id || item.fullName || index}`}
          className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {item.fullName || "N/A"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {renderSecondary(item)}
              </p>
            </div>
            {renderBadge ? renderBadge(item) : null}
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white px-3 py-2">
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Email
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-700">
                {item.email || "N/A"}
              </dd>
            </div>
            <div className="rounded-xl bg-white px-3 py-2">
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Details
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-700">
                {renderSecondary(item)}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function AdminDashboardHome() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [herbalists, setHerbalists] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [usersResponse, patientsResponse, herbalistsResponse] =
          await Promise.all([
            getAllUsers().catch(() => null),
            getAllPatients(1, 25).catch(() => null),
            getAllHerbalists().catch(() => null),
          ]);

        if (!isMounted) return;

        setUsers(getItems(usersResponse).map(normalizeUser));
        setPatients(getItems(patientsResponse).map(normalizePatient));
        setHerbalists(getItems(herbalistsResponse).map(normalizeHerbalist));
      } catch (err) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Unable to load admin dashboard data.";
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentUsers = useMemo(() => users.slice(0, 6), [users]);
  const recentPatients = useMemo(() => patients.slice(0, 6), [patients]);
  const recentHerbalists = useMemo(() => herbalists.slice(0, 6), [herbalists]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section
        id="overview"
        className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              {t("adminDashboard.badge")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminDashboard.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t("adminDashboard.subtitle")}
            </p>
          </div>

          <div className="grid gap-3 text-sm md:min-w-72">
            <a
              href={SWAGGER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 transition-transform hover:-translate-y-0.5"
            >
              <span>{t("adminDashboard.apiDocs")}</span>
              <FaExternalLinkAlt className="text-slate-500" />
            </a>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                {t("adminDashboard.directLogin")}
              </p>
              <p className="mt-2 font-semibold text-white">
                herbal.ai200@gmail.com
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                {t("adminDashboard.directLoginHint")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FaUsers}
          label={t("adminDashboard.stats.users")}
          value={users.length}
        />
        <StatCard
          icon={FaUser}
          label={t("adminDashboard.stats.patients")}
          value={patients.length}
        />
        <StatCard
          icon={FaLeaf}
          label={t("adminDashboard.stats.herbalists")}
          value={herbalists.length}
        />
        <StatCard
          icon={FaDatabase}
          label={t("adminDashboard.stats.api")}
          value="Live"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Loading admin data
          </p>
        </div>
      ) : null}

      {!isLoading && (
        <div className="space-y-6">
          <SectionCard
            id="users"
            title={t("adminDashboard.sections.users")}
            description="All registered account records returned by the published Users API."
          >
            <PeopleGrid
              items={recentUsers}
              emptyMessage={t("adminDashboard.empty.users")}
              renderBadge={(item) => (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {item.role || "N/A"}
                </span>
              )}
              renderSecondary={(item) => item.phone || "No phone number"}
            />
          </SectionCard>

          <SectionCard
            id="patients"
            title={t("adminDashboard.sections.patients")}
            description="Patients registered in the system and their published demographics."
          >
            <PeopleGrid
              items={recentPatients}
              emptyMessage={t("adminDashboard.empty.patients")}
              renderBadge={(item) => (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                  {item.gender || "N/A"}
                </span>
              )}
              renderSecondary={(item) =>
                [item.birthDate, item.age ? `${item.age} yrs` : null]
                  .filter(Boolean)
                  .join(" • ") || "No patient details"
              }
            />
          </SectionCard>

          <SectionCard
            id="herbalists"
            title={t("adminDashboard.sections.herbalists")}
            description="Herbalist profiles published through the live API."
          >
            <PeopleGrid
              items={recentHerbalists}
              emptyMessage={t("adminDashboard.empty.herbalists")}
              renderBadge={(item) => (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {item.rating ? `★ ${item.rating}` : "N/A"}
                </span>
              )}
              renderSecondary={(item) =>
                item.licenseNumber || item.bio || "No profile details"
              }
            />
          </SectionCard>

          <SectionCard
            id="api"
            title={t("adminDashboard.sections.api")}
            description="This project uses the published API as the single source of truth for admin data."
          >
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  API base URL
                </p>
                <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  https://herbal-api-v1-geg9dub2brgee4ag.austriaeast-01.azurewebsites.net
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Admin access note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The admin account is pre-created. It should log in directly
                  with the provided email and password without a public
                  registration flow.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate("/auth/login");
        return;
      }

      const userData = getUserFromToken();
      const role = getUserRole();

      if (role !== "SuperAdmin") {
        navigate("/");
        return;
      }

      setUser(userData);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const displayUser = useMemo(() => user, [user]);

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      user={displayUser}
      navigation={getAdminNavConfig(t)}
      onLogout={handleLogout}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <Routes>
        <Route path="/" element={<AdminUsersPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default AdminDashboard;
