import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaBan,
  FaBook,
  FaCheckCircle,
  FaChevronRight,
  FaLayerGroup,
  FaSeedling,
  FaSyncAlt,
  FaUser,
  FaUsers,
  FaUserMd,
  FaHeart,
  FaStar,
  FaTrophy,
} from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";
import { fetchAdminAiChatStatistics } from "@api/aiChat";
import { getAdminAiConsultationsStatistics } from "@api/aiConsultations";
import { getAllUsers } from "@api/users";
import { getAllPatients } from "@api/patients";
import { getAllHerbalists } from "@api/herbalists";
import { getAllRecipes, getRecipeById } from "@api/recipes";
import { getAllHerbs, getHerbById } from "@api/herbs";
import { normalizeUsersResponse } from "@features/admin/services/adminUsers";
import { getAdminFavoritesOverview, getAdminFavoritesTopStats } from "@api/favorites";
import { getUserById } from "@api/users";

const extractListCount = (payload) => {
  if (payload == null) return 0;

  const totalCount = [
    payload?.totalCount,
    payload?.TotalCount,
    payload?.totalItems,
    payload?.TotalItems,
    payload?.data?.totalCount,
    payload?.data?.totalItems,
  ].find((value) => typeof value === "number");

  if (typeof totalCount === "number") return totalCount;

  if (Array.isArray(payload)) return payload.length;

  const items = payload?.items ?? payload?.data?.items ?? payload?.data;
  if (Array.isArray(items)) return items.length;

  return 0;
};

function StatCard({ icon, label, value, hint, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 truncate text-3xl font-black text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

function AdminOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiStats, setAiStats] = useState(null);
  const [aiConsultationsStats, setAiConsultationsStats] = useState(null);
  const [favoritesOverview, setFavoritesOverview] = useState(null);
  const [favoritesTopStats, setFavoritesTopStats] = useState(null);
  const [platformStats, setPlatformStats] = useState({
    users: 0,
    patients: 0,
    herbalists: 0,
    recipes: 0,
    herbs: 0,
  });

  const load = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [
        aiResult,
        usersResult,
        patientsResult,
        herbalistsResult,
        recipesResult,
        herbsResult,
        aiConsultationsResult,
        favOverviewResult,
        favTopStatsResult,
      ] = await Promise.allSettled([
        fetchAdminAiChatStatistics(),
        getAllUsers({ PageNumber: 1, PageSize: 1 }),
        getAllPatients(1, 1),
        getAllHerbalists(),
        getAllRecipes(1, 1),
        getAllHerbs(1, 1),
        getAdminAiConsultationsStatistics(),
        getAdminFavoritesOverview(),
        getAdminFavoritesTopStats(),
      ]);

      if (aiResult.status === "fulfilled") {
        setAiStats(aiResult.value);
      } else {
        setAiStats(null);
        const message =
          aiResult.reason?.response?.data?.message ||
          aiResult.reason?.response?.data?.title ||
          t("adminDashboard.loadError", "Unable to load overview statistics.");
        setError(message);
        toast.error(message);
      }

      if (aiConsultationsResult.status === "fulfilled") {
        setAiConsultationsStats(aiConsultationsResult.value);
      } else {
        setAiConsultationsStats(null);
      }

      if (favOverviewResult.status === "fulfilled") {
        setFavoritesOverview(favOverviewResult.value);
      } else {
        setFavoritesOverview(null);
      }

      if (favTopStatsResult.status === "fulfilled" && favTopStatsResult.value) {
        const topStats = { ...favTopStatsResult.value };
        const fetches = [];

        if (topStats.mostFavoritedHerbId) {
          fetches.push(
            getHerbById(topStats.mostFavoritedHerbId)
              .then((herb) => {
                topStats.mostFavoritedHerbName = herb.herbName;
              })
              .catch(() => {})
          );
        }

        if (topStats.mostFavoritedRecipeId) {
          fetches.push(
            getRecipeById(topStats.mostFavoritedRecipeId)
              .then((recipe) => {
                topStats.mostFavoritedRecipeName = recipe.title || recipe.recipeName || recipe.recommendedRecipeName || recipe.name;
              })
              .catch(() => {})
          );
        }

        if (topStats.mostFavoritedHerbalistId) {
          fetches.push(
            getUserById(topStats.mostFavoritedHerbalistId)
              .then((user) => {
                topStats.mostFavoritedHerbalistName = user.fullName || user.userName || user.name;
              })
              .catch(() => {})
          );
        }

        await Promise.allSettled(fetches);
        setFavoritesTopStats(topStats);
      } else {
        setFavoritesTopStats(null);
      }

      setPlatformStats({
        users:
          usersResult.status === "fulfilled"
            ? normalizeUsersResponse(usersResult.value).totalCount ||
              extractListCount(usersResult.value)
            : 0,
        patients:
          patientsResult.status === "fulfilled"
            ? extractListCount(patientsResult.value)
            : 0,
        herbalists:
          herbalistsResult.status === "fulfilled"
            ? extractListCount(herbalistsResult.value)
            : 0,
        recipes:
          recipesResult.status === "fulfilled"
            ? extractListCount(recipesResult.value)
            : 0,
        herbs:
          herbsResult.status === "fulfilled"
            ? extractListCount(herbsResult.value)
            : 0,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminDashboard.loadError", "Unable to load overview statistics.");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeRate =
    aiStats?.totalAiConsultations > 0
      ? Math.round(
          (aiStats.activeConsultations / aiStats.totalAiConsultations) * 100,
        )
      : 0;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <MdSmartToy className="text-sm" />
              {t("adminDashboard.badge")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminDashboard.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t("adminDashboard.overviewSubtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-60"
          >
            <FaSyncAlt className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
            {t("adminDashboard.refresh", "Refresh")}
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            {t("adminDashboard.loading", "Loading statistics")}
          </p>
        </div>
      ) : null}

      {!isLoading ? (
        <>
          <section>
            <SectionHeading
              title={t("adminDashboard.sections.platform")}
              description={t("adminDashboard.sections.platformDescription")}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                icon={<FaUsers className="text-2xl" />}
                label={t("adminDashboard.stats.users")}
                value={platformStats.users}
                hint={t("adminDashboard.stats.usersHint")}
                tone="violet"
              />
              <StatCard
                icon={<FaUser className="text-2xl" />}
                label={t("adminDashboard.stats.patients")}
                value={platformStats.patients}
                hint={t("adminDashboard.stats.patientsHint")}
                tone="sky"
              />
              <StatCard
                icon={<FaUserMd className="text-2xl" />}
                label={t("adminDashboard.stats.herbalists")}
                value={platformStats.herbalists}
                hint={t("adminDashboard.stats.herbalistsHint")}
                tone="emerald"
              />
              <StatCard
                icon={<FaBook className="text-2xl" />}
                label={t("adminDashboard.stats.recipes")}
                value={platformStats.recipes}
                hint={t("adminDashboard.stats.recipesHint")}
                tone="amber"
              />
              <StatCard
                icon={<FaSeedling className="text-2xl" />}
                label={t("adminDashboard.stats.herbs")}
                value={platformStats.herbs}
                hint={t("adminDashboard.stats.herbsHint")}
                tone="slate"
              />
            </div>
          </section>

          {aiStats ? (
            <section>
              <SectionHeading
                title={t("adminDashboard.sections.aiConsultations")}
                description={t("adminDashboard.sections.aiConsultationsDescription")}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<MdSmartToy className="text-2xl" />}
                  label={t("adminDashboard.stats.totalConsultations")}
                  value={aiStats.totalAiConsultations ?? 0}
                  hint={t("adminDashboard.stats.totalConsultationsHint")}
                  tone="emerald"
                />
                <StatCard
                  icon={<FaCheckCircle className="text-2xl" />}
                  label={t("adminDashboard.stats.activeConsultations")}
                  value={aiStats.activeConsultations ?? 0}
                  hint={t("adminDashboard.stats.activeConsultationsHint", {
                    rate: activeRate,
                  })}
                  tone="sky"
                />
                <StatCard
                  icon={<FaBan className="text-2xl" />}
                  label={t("adminDashboard.stats.blockedConsultations")}
                  value={aiStats.blockedConsultations ?? 0}
                  hint={t("adminDashboard.stats.blockedConsultationsHint")}
                  tone="rose"
                />
                <StatCard
                  icon={<FaLayerGroup className="text-2xl" />}
                  label={t("adminDashboard.stats.topCategory")}
                  value={aiStats.mostRequestedCategory || "—"}
                  hint={t("adminDashboard.stats.topCategoryHint")}
                  tone="amber"
                />
              </div>
            </section>
          ) : null}

          {aiConsultationsStats ? (
            <section>
              <SectionHeading
                title={t("adminDashboard.sections.aiConsultationsStats", "AI Diagnoses Statistics")}
                description={t("adminDashboard.sections.aiConsultationsStatsDesc", "Overview of AI medical consultations and diagnoses.")}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  icon={<MdSmartToy className="text-2xl" />}
                  label={t("adminDashboard.stats.totalAiConsultations", "Total AI Consultations")}
                  value={aiConsultationsStats.totalAiConsultations ?? 0}
                  tone="emerald"
                />
                <StatCard
                  icon={<FaCheckCircle className="text-2xl" />}
                  label={t("adminDashboard.stats.avgConfidence", "Average Confidence Score")}
                  value={`${aiConsultationsStats.averageConfidenceScore?.toFixed(1) ?? 0}%`}
                  tone="sky"
                />
                <StatCard
                  icon={<FaLayerGroup className="text-2xl" />}
                  label={t("adminDashboard.stats.mostDiagnosed", "Most Diagnosed Condition")}
                  value={aiConsultationsStats.mostDiagnosedCondition || "—"}
                  tone="amber"
                />
              </div>
            </section>
          ) : null}

          {favoritesOverview ? (
            <section>
              <SectionHeading
                title={t("adminDashboard.sections.favoritesOverview", "Favorites Overview")}
                description={t("adminDashboard.sections.favoritesOverviewDesc", "Overall statistics of favorited items across the platform.")}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                  icon={<FaHeart className="text-2xl" />}
                  label={t("adminDashboard.stats.totalFavs", "Total Favorites")}
                  value={favoritesOverview.totalSystemFavorites ?? 0}
                  tone="emerald"
                />
                <StatCard
                  icon={<FaSeedling className="text-2xl" />}
                  label={t("adminDashboard.stats.totalHerbsFaved", "Favorited Herbs")}
                  value={favoritesOverview.totalHerbsFaved ?? 0}
                  tone="slate"
                />
                <StatCard
                  icon={<FaBook className="text-2xl" />}
                  label={t("adminDashboard.stats.totalRecipesFaved", "Favorited Recipes")}
                  value={favoritesOverview.totalRecipesFaved ?? 0}
                  tone="amber"
                />
                <StatCard
                  icon={<MdSmartToy className="text-2xl" />}
                  label={t("adminDashboard.stats.totalAiRecipesFaved", "Favorited AI Recipes")}
                  value={favoritesOverview.totalAiRecipesFaved ?? 0}
                  tone="sky"
                />
                <StatCard
                  icon={<MdSmartToy className="text-2xl" />}
                  label={t("adminDashboard.stats.totalAiChatRecipesFaved", "Favorited AI Chat")}
                  value={favoritesOverview.totalAiChatRecipesFaved ?? 0}
                  tone="violet"
                />
                <StatCard
                  icon={<FaUserMd className="text-2xl" />}
                  label={t("adminDashboard.stats.totalHerbalistsFaved", "Favorited Herbalists")}
                  value={favoritesOverview.totalHerbalistsFaved ?? 0}
                  tone="emerald"
                />
              </div>
            </section>
          ) : null}

          {favoritesTopStats ? (
            <section>
              <SectionHeading
                title={t("adminDashboard.sections.favoritesTopStats", "Top Favorited Entities")}
                description={t("adminDashboard.sections.favoritesTopStatsDesc", "Most popular items favorited by users.")}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  icon={<FaStar className="text-2xl" />}
                  label={t("adminDashboard.stats.mostFavoritedHerb", "Most Favorited Herb")}
                  value={favoritesTopStats.mostFavoritedHerbName || `ID: ${favoritesTopStats.mostFavoritedHerbId ?? "N/A"}`}
                  hint={favoritesTopStats.mostFavoritedHerbId ? `Favorited ${favoritesTopStats.mostFavoritedHerbCount ?? 0} times` : ""}
                  tone="slate"
                />
                <StatCard
                  icon={<FaTrophy className="text-2xl" />}
                  label={t("adminDashboard.stats.mostFavoritedRecipe", "Most Favorited Recipe")}
                  value={favoritesTopStats.mostFavoritedRecipeName || `ID: ${favoritesTopStats.mostFavoritedRecipeId ?? "N/A"}`}
                  hint={favoritesTopStats.mostFavoritedRecipeId ? `Favorited ${favoritesTopStats.mostFavoritedRecipeCount ?? 0} times` : ""}
                  tone="amber"
                />
                <StatCard
                  icon={<FaUserMd className="text-2xl" />}
                  label={t("adminDashboard.stats.mostFavoritedHerbalist", "Most Favorited Herbalist")}
                  value={favoritesTopStats.mostFavoritedHerbalistName || `ID: ${favoritesTopStats.mostFavoritedHerbalistId ?? "N/A"}`}
                  hint={favoritesTopStats.mostFavoritedHerbalistId ? `Favorited ${favoritesTopStats.mostFavoritedHerbalistCount ?? 0} times` : ""}
                  tone="emerald"
                />
              </div>
            </section>
          ) : null}

          {aiStats ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t("adminDashboard.quickActions.title")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("adminDashboard.quickActions.subtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard/ai-chat")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  {t("adminDashboard.quickActions.viewConsultations")}
                  <FaChevronRight className="text-xs" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {t("adminDashboard.summary.activeShare")}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {activeRate}%
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {t("adminDashboard.summary.blockedShare")}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {aiStats.totalAiConsultations > 0
                      ? Math.round(
                          (aiStats.blockedConsultations /
                            aiStats.totalAiConsultations) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50/80 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    {t("adminDashboard.summary.leadingCategory")}
                  </p>
                  <p className="mt-2 text-lg font-black text-emerald-900">
                    {aiStats.mostRequestedCategory || "—"}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default AdminOverviewPage;
