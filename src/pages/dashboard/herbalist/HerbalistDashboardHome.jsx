import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaLeaf,
  FaRegClock,
  FaStethoscope,
  FaSyncAlt,
  FaUserCircle,
} from "react-icons/fa";
import { getAllHerbs } from "../../../api/herbs";
import { getMyInventory } from "../../../api/inventory";
import { getRecipesByHerbalist } from "../../../api/recipes";
import { normalizeHerb } from "../../../services/herbs";
import { normalizeInventoryList } from "../../../services/inventory";
import { normalizeRecipe } from "../../../services/recipes";

const extractInventoryArray = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.items)) {
    return responseData.items;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  return `${value.toFixed(2)} EGP`;
};

function StatCard({ title, value, subtitle, icon: Icon, tone = "emerald" }) {
  const toneClasses = {
    emerald: "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700",
    blue: "from-blue-50 to-cyan-50 border-blue-100 text-blue-700",
    amber: "from-amber-50 to-orange-50 border-amber-100 text-amber-700",
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-700",
  };

  return (
    <article
      className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm ${toneClasses[tone] || toneClasses.slate}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-2 text-sm font-medium text-slate-600">{subtitle}</p>
        </div>
        <div className="rounded-xl bg-white/80 p-3 shadow-sm">
          <Icon className="text-lg" />
        </div>
      </div>
    </article>
  );
}

function HerbalistDashboardHome({
  user,
  dashboardData,
  isLoadingDashboard,
  onRetryDashboard,
}) {
  const navigate = useNavigate();

  const herbalistId = useMemo(
    () => dashboardData?.herbalistProfile?.id || user?.id,
    [dashboardData?.herbalistProfile?.id, user?.id],
  );

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");
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
        getAllHerbs(),
        getRecipesByHerbalist(herbalistId),
        getMyInventory(),
      ]);

    const hasPartialError =
      herbsResult.status === "rejected" ||
      recipesResult.status === "rejected" ||
      inventoryResult.status === "rejected";

    const herbsRaw =
      herbsResult.status === "fulfilled" ? herbsResult.value : [];
    const recipesRaw =
      recipesResult.status === "fulfilled" && Array.isArray(recipesResult.value)
        ? recipesResult.value
        : [];
    const inventoryRaw =
      inventoryResult.status === "fulfilled"
        ? extractInventoryArray(inventoryResult.value)
        : [];

    const normalizedHerbs = Array.isArray(herbsRaw)
      ? herbsRaw.map(normalizeHerb)
      : [];
    const myHerbs = normalizedHerbs.filter(
      (herb) => Number(herb.herbalistId) === Number(herbalistId),
    );

    const normalizedRecipes = recipesRaw.map(normalizeRecipe);
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

    if (hasPartialError) {
      setStatsError(
        "Some dashboard metrics could not be loaded. You can still manage your data from each section.",
      );
    }

    setIsLoadingStats(false);
  }, [herbalistId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const profile = dashboardData?.herbalistProfile || {};

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Herbalist Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Welcome back, {user?.name || "Herbalist"}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Track your herbs, recipes, inventory availability, and profile
              readiness from one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onRetryDashboard?.();
                loadStats();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FaSyncAlt className="text-xs" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {statsError ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {statsError}
        </div>
      ) : null}

      {isLoadingDashboard || isLoadingStats ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading dashboard metrics...
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="My Herbs"
              value={stats.herbsCount}
              subtitle="Herbs created by your account"
              icon={FaLeaf}
              tone="emerald"
            />
            <StatCard
              title="My Recipes"
              value={stats.recipesCount}
              subtitle={`${stats.activeRecipesCount} active recipes`}
              icon={FaStethoscope}
              tone="blue"
            />
            <StatCard
              title="Inventory Items"
              value={stats.inventoryTotal}
              subtitle={`${stats.inventoryActive} active listings`}
              icon={FaBoxOpen}
              tone="amber"
            />
            <StatCard
              title="Average Price"
              value={formatCurrency(stats.inventoryAveragePrice)}
              subtitle="Across all inventory herbs"
              icon={FaRegClock}
              tone="slate"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Jump directly to the most-used sections in your workspace.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/herbalist/dashboard/herbs")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Manage Herbs
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/herbalist/dashboard/recipes")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Manage Recipes
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/herbalist/dashboard/inventory")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Manage Inventory
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/herbalist/dashboard/profile")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Update Profile
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">
                Profile Snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your professional visibility details.
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bio
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {profile.bio ? "Completed" : "Missing"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Availability
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {profile.availableFrom && profile.availableTo
                      ? `${profile.availableFrom} - ${profile.availableTo}`
                      : "Not configured"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rating
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {profile.averageRating != null &&
                    profile.averageRating !== ""
                      ? String(profile.averageRating)
                      : "Not rated yet"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Account
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FaUserCircle className="text-slate-500" />{" "}
                    {user?.email || "No email found"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}

export default HerbalistDashboardHome;
