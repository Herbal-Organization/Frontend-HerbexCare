import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCalendarAlt,
  FaLeaf,
  FaRegClock,
  FaShoppingBag,
  FaStethoscope,
  FaUserCircle,
} from "react-icons/fa";
import { motion } from "motion/react";
import { getAllHerbs } from "@api/herbs";
import { getMyInventory } from "@api/inventory";
import { getRecipesByHerbalist } from "@api/recipes";
import { normalizeHerb } from "@features/browse/services/herbs";
import { normalizeInventoryList } from "@features/herbalist/services/inventory";
import { normalizeRecipe } from "@features/browse/services/recipes";
import { getHerbalistDisplayName } from "@features/herbalist/services/herbalistProfile";
import { Spinner } from "@components/common";
import { cn } from "@utils/cn";

const extractInventoryArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const extractHerbsArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const extractRecipesArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} EGP`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function StatCard({ title, value, subtitle, icon: Icon, tone = "emerald" }) {
  const toneClasses = {
    emerald:
      "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700 dark:from-emerald-950/40 dark:to-teal-950/40 dark:border-emerald-800 dark:text-emerald-400",
    blue: "from-blue-50 to-cyan-50 border-blue-100 text-blue-700 dark:from-blue-950/40 dark:to-cyan-950/40 dark:border-blue-800 dark:text-blue-400",
    amber:
      "from-amber-50 to-orange-50 border-amber-100 text-amber-700 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-800 dark:text-amber-400",
    slate:
      "from-slate-50 to-slate-100 border-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-800/50 dark:border-slate-700 dark:text-slate-400",
  };

  return (
    <motion.article
      variants={itemVariants}
      className={cn(
        "rounded-2xl border bg-linear-to-br p-5 shadow-sm transition-shadow duration-200 hover:shadow-md",
        toneClasses[tone] || toneClasses.slate,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
            {value}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-800/80">
          <Icon className="text-lg" />
        </div>
      </div>
    </motion.article>
  );
}

function WorkshopLink({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  isRtl,
}) {
  const { t } = useTranslation();

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      onClick={onClick}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-start shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-700/50 dark:bg-slate-800/50"
    >
      <div
        className={cn(
          "mb-4 inline-flex rounded-2xl p-3.5 text-white shadow-lg transition-transform duration-200 group-hover:scale-105",
          color,
        )}
      >
        <Icon className="text-lg" />
      </div>
      <h3 className="font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
        {t("common.explore", "Explore")}
        <FaArrowRight
          className={cn(
            "text-xs transition-transform group-hover:translate-x-0.5",
            isRtl && "rotate-180 group-hover:-translate-x-0.5",
          )}
        />
      </span>
    </motion.button>
  );
}

function PracticeRow({ label, value, isComplete }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-700/50">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "text-end text-sm font-medium",
          isComplete
            ? "text-slate-800 dark:text-slate-200"
            : "text-amber-600 dark:text-amber-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function HerbalistDashboardHome({
  user,
  dashboardData,
  isLoadingDashboard,
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const herbalistId = useMemo(
    () => dashboardData?.herbalistProfile?.id || user?.id,
    [dashboardData?.herbalistProfile?.id, user?.id],
  );

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [, setStatsError] = useState("");
  const [stats, setStats] = useState({
    herbsCount: 0,
    recipesCount: 0,
    activeRecipesCount: 0,
    inventoryTotal: 0,
    inventoryActive: 0,
    inventoryAveragePrice: null,
  });

  const loadStats = useCallback(async () => {
    if (!herbalistId) {
      setIsLoadingStats(false);
      return;
    }

    setIsLoadingStats(true);
    setStatsError("");

    const [herbsResult, recipesResult, inventoryResult] =
      await Promise.allSettled([
        getAllHerbs(1, 1000),
        getRecipesByHerbalist(herbalistId, 1, 1000),
        getMyInventory(),
      ]);

    const hasPartialError =
      herbsResult.status === "rejected" ||
      recipesResult.status === "rejected" ||
      inventoryResult.status === "rejected";

    if (hasPartialError) {
      setStatsError(t("herbalistDashboard.partialError"));
    }

    const herbsRaw =
      herbsResult.status === "fulfilled" ? herbsResult.value : [];
    const recipesRaw =
      recipesResult.status === "fulfilled" ? recipesResult.value : [];
    const inventoryRaw =
      inventoryResult.status === "fulfilled"
        ? extractInventoryArray(inventoryResult.value)
        : [];

    const normalizedHerbs = extractHerbsArray(herbsRaw).map(normalizeHerb);
    const myHerbs = normalizedHerbs.filter(
      (herb) => Number(herb.herbalistId) === Number(herbalistId),
    );

    const normalizedRecipes = extractRecipesArray(recipesRaw).map(normalizeRecipe);
    const inventoryItems = normalizeInventoryList(inventoryRaw);
    const activeInventoryItems = inventoryItems.filter((item) => item.isActive);
    const pricedItems = inventoryItems
      .map((item) => Number(item.pricePerKilo))
      .filter((value) => Number.isFinite(value));

    const averagePrice =
      pricedItems.length > 0
        ? pricedItems.reduce((sum, current) => sum + current, 0) /
          pricedItems.length
        : null;

    setStats({
      herbsCount: myHerbs.length,
      recipesCount: normalizedRecipes.length,
      activeRecipesCount: normalizedRecipes.filter(
        (recipe) => recipe.isActive !== false,
      ).length,
      inventoryTotal: inventoryItems.length,
      inventoryActive: activeInventoryItems.length,
      inventoryAveragePrice: averagePrice,
    });

    setIsLoadingStats(false);
  }, [herbalistId, t]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const profile = dashboardData?.herbalistProfile || {};
  const displayName = getHerbalistDisplayName(user);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(i18n.language, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [i18n.language],
  );

  const profileChecks = useMemo(() => {
    const hasBio = Boolean(profile.bio);
    const hasAvailability = Boolean(
      profile.availableFrom && profile.availableTo,
    );
    const hasRating =
      profile.averageRating != null && profile.averageRating !== "";
    const filled = [hasBio, hasAvailability, hasRating].filter(Boolean).length;
    return { hasBio, hasAvailability, hasRating, filled };
  }, [profile]);

  const workshopLinks = [
    {
      key: "herbs",
      title: t("herbalistDashboard.workshop.herbs"),
      description: t("herbalistDashboard.workshop.herbsDesc"),
      icon: FaLeaf,
      color: "bg-emerald-500 shadow-emerald-200/40",
      href: "/herbalist/dashboard/herbs/managed",
    },
    {
      key: "recipes",
      title: t("herbalistDashboard.workshop.recipes"),
      description: t("herbalistDashboard.workshop.recipesDesc"),
      icon: FaStethoscope,
      color: "bg-blue-500 shadow-blue-200/40",
      href: "/herbalist/dashboard/recipes",
    },
    {
      key: "inventory",
      title: t("herbalistDashboard.workshop.inventory"),
      description: t("herbalistDashboard.workshop.inventoryDesc"),
      icon: FaBoxOpen,
      color: "bg-amber-500 shadow-amber-200/40",
      href: "/herbalist/dashboard/herbs/inventory",
    },
    {
      key: "orders",
      title: t("herbalistDashboard.workshop.orders"),
      description: t("herbalistDashboard.workshop.ordersDesc"),
      icon: FaShoppingBag,
      color: "bg-indigo-500 shadow-indigo-200/40",
      href: "/herbalist/dashboard/orders",
    },
    {
      key: "profile",
      title: t("herbalistDashboard.workshop.profile"),
      description: t("herbalistDashboard.workshop.profileDesc"),
      icon: FaUserCircle,
      color: "bg-purple-500 shadow-purple-200/40",
      href: "/herbalist/dashboard/profile",
    },
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl flex-1 space-y-8"
    >
      {/* Hero — aligned with patient dashboard */}
      <motion.header
        variants={itemVariants}
        className="relative overflow-hidden rounded-4xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-emerald-900/30 dark:bg-slate-900 md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-50/80 via-white to-teal-50/30 dark:from-emerald-900/20 dark:via-slate-900 dark:to-teal-900/10" />
        <div className="pointer-events-none absolute -top-40 -inset-s-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-[80px] dark:bg-emerald-500/5" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary dark:text-emerald-400">
              {t("herbalistSidebar.tagline")}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl lg:text-5xl">
              {t("herbalistDashboard.greeting", { name: displayName })}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 md:text-base">
              {t("herbalistDashboard.subtitle")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/60 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-800/40 lg:min-w-52">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <FaCalendarAlt className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {t("herbalistDashboard.today")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {todayLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {isLoadingDashboard || isLoadingStats ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 dark:border-slate-700/50 dark:bg-slate-800/50"
        >
          <Spinner size="md" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("herbalistDashboard.loadingMetrics")}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title={t("herbalistDashboard.stats.herbs")}
              value={stats.herbsCount}
              subtitle={t("herbalistDashboard.stats.herbsHint")}
              icon={FaLeaf}
              tone="emerald"
            />
            <StatCard
              title={t("herbalistDashboard.stats.recipes")}
              value={stats.recipesCount}
              subtitle={t("herbalistDashboard.stats.recipesHint", {
                active: stats.activeRecipesCount,
              })}
              icon={FaStethoscope}
              tone="blue"
            />
            <StatCard
              title={t("herbalistDashboard.stats.inventory")}
              value={stats.inventoryTotal}
              subtitle={t("herbalistDashboard.stats.inventoryHint", {
                active: stats.inventoryActive,
              })}
              icon={FaBoxOpen}
              tone="amber"
            />
            <StatCard
              title={t("herbalistDashboard.stats.price")}
              value={formatCurrency(stats.inventoryAveragePrice)}
              subtitle={t("herbalistDashboard.stats.priceHint")}
              icon={FaRegClock}
              tone="slate"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <motion.section variants={itemVariants} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                  {t("herbalistDashboard.workshop.title")}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("herbalistDashboard.workshop.subtitle")}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {workshopLinks.map((link) => (
                  <WorkshopLink
                    key={link.key}
                    title={link.title}
                    description={link.description}
                    icon={link.icon}
                    color={link.color}
                    isRtl={isRtl}
                    onClick={() => navigate(link.href)}
                  />
                ))}
              </div>
            </motion.section>

            <motion.section
              variants={itemVariants}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {t("herbalistDashboard.practice.title")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t("herbalistDashboard.practice.subtitle")}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-emerald-400">
                    {t("herbalistDashboard.practice.readiness")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profileChecks.filled === 3
                      ? t("herbalistDashboard.practice.readinessComplete")
                      : t("herbalistDashboard.practice.readinessPartial", {
                          count: profileChecks.filled,
                        })}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div
                  className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
                  role="progressbar"
                  aria-valuenow={profileChecks.filled}
                  aria-valuemin={0}
                  aria-valuemax={3}
                  aria-label={t("herbalistDashboard.practice.readiness")}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(profileChecks.filled / 3) * 100}%` }}
                  />
                </div>

                <PracticeRow
                  label={t("herbalistDashboard.practice.bio")}
                  value={
                    profileChecks.hasBio
                      ? t("herbalistDashboard.practice.bioDone")
                      : t("herbalistDashboard.practice.bioMissing")
                  }
                  isComplete={profileChecks.hasBio}
                />
                <PracticeRow
                  label={t("herbalistDashboard.practice.availability")}
                  value={
                    profileChecks.hasAvailability
                      ? t("herbalistDashboard.practice.availabilitySet", {
                          from: profile.availableFrom,
                          to: profile.availableTo,
                        })
                      : t("herbalistDashboard.practice.availabilityMissing")
                  }
                  isComplete={profileChecks.hasAvailability}
                />
                <PracticeRow
                  label={t("herbalistDashboard.practice.rating")}
                  value={
                    profileChecks.hasRating
                      ? t("herbalistDashboard.practice.ratingValue", {
                          rating: profile.averageRating,
                        })
                      : t("herbalistDashboard.practice.ratingMissing")
                  }
                  isComplete={profileChecks.hasRating}
                />
                <PracticeRow
                  label={t("herbalistDashboard.practice.account")}
                  value={user?.email || "—"}
                  isComplete={Boolean(user?.email)}
                />
              </div>
            </motion.section>
          </div>
        </>
      )}
    </motion.section>
  );
}

export default HerbalistDashboardHome;
