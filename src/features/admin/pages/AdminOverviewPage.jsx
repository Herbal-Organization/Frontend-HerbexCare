import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaBook,
  FaChevronRight,
  FaHeart,
  FaSeedling,
  FaStar,
  FaSyncAlt,
  FaTrophy,
  FaUser,
  FaUserMd,
  FaUsers,
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
import {
  getAdminFavoritesOverview,
  getAdminFavoritesTopStats,
} from "@api/favorites";
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
  const accents = {
    emerald: "border-l-emerald-500",
    sky: "border-l-sky-500",
    rose: "border-l-rose-500",
    amber: "border-l-amber-500",
    violet: "border-l-violet-500",
    slate: "border-l-slate-400",
  };

  const iconBg = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${accents[tone]} bg-white dark:bg-slate-800/50 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 truncate">
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          ) : null}
        </div>
        <div
          className={`flex-shrink-0 rounded-lg p-2.5 ${iconBg[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 text-start shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-emerald-600"
    >
      <div className="flex-shrink-0 rounded-lg bg-emerald-50 p-2.5 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {title}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {description}
        </p>
      </div>
      <FaChevronRight className="mt-1 flex-shrink-0 text-xs text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-slate-600" />
    </button>
  );
}

function DonutChart({ active, blocked, size = 120 }) {
  const total = active + blocked;
  const activePercent = total > 0 ? (active / total) * 100 : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          className="stroke-slate-100 dark:stroke-slate-700"
          strokeWidth="3.5"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          className="stroke-emerald-500"
          strokeWidth="3.5"
          strokeDasharray={`${activePercent} ${100 - activePercent}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-slate-900 dark:text-slate-50">
          {activePercent.toFixed(0)}%
        </span>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          active
        </span>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-5"
          >
            <Skeleton width={80} height={12} />
            <Skeleton width={60} height={32} className="mt-3" />
            <Skeleton width={100} height={12} className="mt-2" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-5"
          >
            <Skeleton width={100} height={14} />
            <Skeleton width={80} height={12} className="mt-3" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <Skeleton width={140} height={14} />
          <Skeleton width={120} height={12} className="mt-3" />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <Skeleton width={140} height={14} />
          <Skeleton width={120} height={12} className="mt-3" />
        </div>
      </div>
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
  const [lastUpdated, setLastUpdated] = useState(null);

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

        if (topStats.mostFavoritedHerbId && !topStats.mostFavoritedHerbName) {
          fetches.push(
            getHerbById(topStats.mostFavoritedHerbId)
              .then((herb) => {
                if (herb?.herbName) topStats.mostFavoritedHerbName = herb.herbName;
              })
              .catch(() => {}),
          );
        }

        if (topStats.mostFavoritedRecipeId && !topStats.mostFavoritedRecipeName) {
          fetches.push(
            getRecipeById(topStats.mostFavoritedRecipeId)
              .then((recipe) => {
                const name =
                  recipe?.title ||
                  recipe?.recipeName ||
                  recipe?.recommendedRecipeName ||
                  recipe?.name;
                if (name) topStats.mostFavoritedRecipeName = name;
              })
              .catch(() => {}),
          );
        }

        if (topStats.mostFavoritedHerbalistId && !topStats.mostFavoritedHerbalistName) {
          fetches.push(
            getUserById(topStats.mostFavoritedHerbalistId)
              .then((user) => {
                const name = user?.fullName || user?.userName || user?.name;
                if (name) topStats.mostFavoritedHerbalistName = name;
              })
              .catch(() => {}),
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

      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        t("adminDashboard.loadError");
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

  const blockedRate =
    aiStats?.totalAiConsultations > 0
      ? Math.round(
          (aiStats.blockedConsultations / aiStats.totalAiConsultations) * 100,
        )
      : 0;

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <MdSmartToy className="text-sm" />
            {t("adminDashboard.badge")}
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            {t("adminDashboard.title")}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("adminDashboard.overviewSubtitle")}
            </p>
            {lastUpdated && !isLoading && (
              <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:inline">
                · {t("adminDashboard.lastUpdated", { time: lastUpdated.toLocaleTimeString() })}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <FaSyncAlt
            className={`text-sm ${isLoading ? "animate-spin" : ""}`}
          />
          {t("adminDashboard.refresh")}
        </button>
      </section>

      {/* Error */}
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      ) : null}

      {/* Loading */}
      {isLoading ? <SkeletonLoader /> : null}

      {/* Content */}
      {!isLoading ? (
        <>
          {/* Key Metrics */}
          <section>
            <StatCard
              icon={<FaUsers className="text-xl" />}
              label={t("adminDashboard.stats.users")}
              value={platformStats.users}
              hint={t("adminDashboard.stats.usersHint")}
              tone="violet"
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={<FaUser className="text-xl" />}
                label={t("adminDashboard.stats.patients")}
                value={platformStats.patients}
                hint={t("adminDashboard.stats.patientsHint")}
                tone="sky"
              />
              <StatCard
                icon={<FaUserMd className="text-xl" />}
                label={t("adminDashboard.stats.herbalists")}
                value={platformStats.herbalists}
                hint={t("adminDashboard.stats.herbalistsHint")}
                tone="emerald"
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t("adminDashboard.quickActions.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("adminDashboard.quickActions.subtitle")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <QuickActionCard
                icon={<FaUsers className="text-lg" />}
                title={t("adminDashboard.quickActions.manageUsers")}
                description={t("adminDashboard.quickActions.manageUsersDesc")}
                onClick={() => navigate("/admin/dashboard/users")}
              />
              <QuickActionCard
                icon={<FaSeedling className="text-lg" />}
                title={t("adminDashboard.quickActions.manageHerbs")}
                description={t("adminDashboard.quickActions.manageHerbsDesc")}
                onClick={() => navigate("/admin/dashboard/herbs")}
              />
              <QuickActionCard
                icon={<MdSmartToy className="text-lg" />}
                title={t("adminDashboard.quickActions.viewAiChats")}
                description={t("adminDashboard.quickActions.viewAiChatsDesc")}
                onClick={() => navigate("/admin/dashboard/ai-chat")}
              />
            </div>
          </section>

          {/* AI Overview */}
          {aiStats || aiConsultationsStats ? (
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t("adminDashboard.sections.aiOverview")}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("adminDashboard.sections.aiOverviewDescription")}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Donut + Legend */}
                {aiStats ? (
                  <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800/50 dark:border-slate-700">
                    <DonutChart
                      active={aiStats.activeConsultations ?? 0}
                      blocked={aiStats.blockedConsultations ?? 0}
                    />
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {t("adminDashboard.aiOverview.activeRatio")}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {t("adminDashboard.aiOverview.activeChats")} ({activeRate}%)
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 dark:text-rose-400">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            {t("adminDashboard.aiOverview.blockedChats")} ({blockedRate}%)
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-slate-50">
                        {aiStats.totalAiConsultations ?? 0}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("adminDashboard.aiOverview.totalChats")}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* AI Consultations Stats */}
                {aiConsultationsStats ? (
                  <div className="grid gap-4 grid-cols-2">
                    <StatCard
                      icon={<MdSmartToy className="text-xl" />}
                      label={t("adminDashboard.aiOverview.avgConfidence")}
                      value={`${aiConsultationsStats.averageConfidenceScore?.toFixed(1) ?? 0}%`}
                      tone="sky"
                    />
                    <StatCard
                      icon={<FaStar className="text-xl" />}
                      label={t("adminDashboard.aiOverview.mostDiagnosed")}
                      value={aiConsultationsStats.mostDiagnosedCondition || "—"}
                      tone="amber"
                    />
                    {aiStats ? (
                      <>
                        <StatCard
                          icon={<FaUserMd className="text-xl" />}
                          label={t("adminDashboard.aiOverview.topCategory")}
                          value={aiStats.mostRequestedCategory || "—"}
                          tone="violet"
                        />
                        <StatCard
                          icon={<FaUser className="text-xl" />}
                          label={t("adminDashboard.stats.activeConsultations")}
                          value={aiStats.activeConsultations ?? 0}
                          hint={t("adminDashboard.stats.activeConsultationsHint", { rate: activeRate })}
                          tone="emerald"
                        />
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Platform Catalogue */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t("adminDashboard.sections.catalogue")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("adminDashboard.sections.catalogueDescription")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={<FaUserMd className="text-xl" />}
                label={t("adminDashboard.stats.herbalists")}
                value={platformStats.herbalists}
                tone="emerald"
              />
              <StatCard
                icon={<FaSeedling className="text-xl" />}
                label={t("adminDashboard.stats.herbs")}
                value={platformStats.herbs}
                tone="slate"
              />
              <StatCard
                icon={<FaBook className="text-xl" />}
                label={t("adminDashboard.stats.recipes")}
                value={platformStats.recipes}
                tone="amber"
              />
            </div>
          </section>

          {/* Favorites & Top Items */}
          {favoritesOverview || favoritesTopStats ? (
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t("adminDashboard.sections.favoritesAndTop")}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("adminDashboard.sections.favoritesAndTopDescription")}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Top Favorited Leaderboard */}
                {favoritesTopStats ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800/50 dark:border-slate-700">
                    <div className="space-y-4">
                      {[
                        {
                          icon: <FaStar className="text-amber-500" />,
                          label: t("adminDashboard.topItems.herb"),
                          name: favoritesTopStats.mostFavoritedHerbName,
                          id: favoritesTopStats.mostFavoritedHerbId,
                          count: favoritesTopStats.mostFavoritedHerbCount,
                        },
                        {
                          icon: <FaTrophy className="text-emerald-500" />,
                          label: t("adminDashboard.topItems.recipe"),
                          name: favoritesTopStats.mostFavoritedRecipeName,
                          id: favoritesTopStats.mostFavoritedRecipeId,
                          count: favoritesTopStats.mostFavoritedRecipeCount,
                        },
                        {
                          icon: <FaUserMd className="text-violet-500" />,
                          label: t("adminDashboard.topItems.herbalist"),
                          name: favoritesTopStats.mostFavoritedHerbalistName,
                          id: favoritesTopStats.mostFavoritedHerbalistId,
                          count: favoritesTopStats.mostFavoritedHerbalistCount,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                              {item.label}
                            </p>
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.name || (item.id ? `ID: ${item.id}` : "—")}
                            </p>
                          </div>
                          {item.count != null && (
                            <span className="flex-shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">
                              {t("adminDashboard.topItems.favoritedCount", { count: item.count })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Favorites Breakdown */}
                {favoritesOverview ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800/50 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                        <FaHeart className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {t("adminDashboard.favorites.total")}
                        </p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                          {favoritesOverview.totalSystemFavorites ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: t("adminDashboard.favorites.herbs"), value: favoritesOverview.totalHerbsFaved, tone: "bg-emerald-500" },
                        { label: t("adminDashboard.favorites.recipes"), value: favoritesOverview.totalRecipesFaved, tone: "bg-amber-500" },
                        { label: t("adminDashboard.favorites.aiRecipes"), value: favoritesOverview.totalAiRecipesFaved, tone: "bg-sky-500" },
                        { label: t("adminDashboard.favorites.herbalists"), value: favoritesOverview.totalHerbalistsFaved, tone: "bg-violet-500" },
                      ].map((item) => {
                        const maxVal = Math.max(
                          favoritesOverview.totalHerbsFaved ?? 0,
                          favoritesOverview.totalRecipesFaved ?? 0,
                          favoritesOverview.totalAiRecipesFaved ?? 0,
                          favoritesOverview.totalHerbalistsFaved ?? 0,
                          1,
                        );
                        const width = ((item.value ?? 0) / maxVal) * 100;

                        return (
                          <div key={item.label}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {item.label}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {item.value ?? 0}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                              <div
                                className={`h-full rounded-full ${item.tone} transition-all duration-500`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default AdminOverviewPage;
