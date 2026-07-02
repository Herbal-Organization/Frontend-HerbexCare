import { useEffect, useMemo, useState } from "react";
import PatientNavbar from "@components/features/browse/PatientNavbar";
import BrowseFilters from "@components/features/browse/BrowseFilters";
import HerbalistFavoriteCard from "@components/features/browse/HerbalistFavoriteCard";
import Pagination from "@components/common/Pagination";
import Footer from "@components/features/landing/Footer";
import { getAllHerbalists } from "@api/herbalists";
import {
  getMyHerbalistsFavorites,
  toggleFavorite,
} from "@api/favorites";
import {
  extractFavoriteItems,
  normalizeHerbalist,
} from "@features/browse/services/herbalists";
import { toast } from "react-hot-toast";
import { FaUserMd } from "react-icons/fa";

const HERBALISTS_PER_PAGE = 8;

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="h-28 bg-slate-200 dark:bg-slate-700" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HerbalistsPage() {
  const [herbalists, setHerbalists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteHerbalistIds, setFavoriteHerbalistIds] = useState(new Set());
  const [favoriteUpdatingIds, setFavoriteUpdatingIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [herbalistsResponse, favoritesResponse] = await Promise.all([
          getAllHerbalists(),
          getMyHerbalistsFavorites().catch(() => []),
        ]);

        const list = extractFavoriteItems(herbalistsResponse);
        setHerbalists(list.map(normalizeHerbalist).filter((h) => h.herbalistId));

        const favoriteItems = extractFavoriteItems(favoritesResponse);
        const ids = new Set(
          favoriteItems
            .map((item) =>
              Number(item?.herbalistId || item?.targetId || item?.id || 0),
            )
            .filter(Boolean),
        );
        setFavoriteHerbalistIds(ids);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.title ||
            "Unable to load herbalists.",
        );
        setHerbalists([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filteredHerbalists = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return herbalists;

    return herbalists.filter((herbalist) =>
      [herbalist.fullName, herbalist.bio, herbalist.licenseNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [herbalists, searchTerm]);

  const paginatedHerbalists = filteredHerbalists.slice(
    (currentPage - 1) * HERBALISTS_PER_PAGE,
    currentPage * HERBALISTS_PER_PAGE,
  );

  const handleToggleFavorite = async (herbalistId) => {
    const id = Number(herbalistId || 0);
    if (!id || favoriteUpdatingIds.has(id)) return;

    setFavoriteUpdatingIds((current) => new Set(current).add(id));

    try {
      await toggleFavorite({ targetId: id, type: "Herbalist" });

      setFavoriteHerbalistIds((current) => {
        const next = new Set(current);
        const wasFavorite = next.has(id);
        if (wasFavorite) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      toast.success(
        favoriteHerbalistIds.has(id)
          ? "Herbalist removed from favorites."
          : "Herbalist added to favorites.",
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update favorite herbalist.";
      toast.error(message);
    } finally {
      setFavoriteUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <PatientNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BrowseFilters
          title="Herbalists"
          description="Browse licensed herbalists and save your trusted providers to favorites."
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          resultCount={filteredHerbalists.length}
          resultLabel={`herbalist${filteredHerbalists.length === 1 ? "" : "s"} available`}
          placeholder="Search by name, license, or bio..."
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-8 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && paginatedHerbalists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-5 mb-5">
              <FaUserMd className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
              No herbalists found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {searchTerm
                ? "No herbalists match your search. Try a different name or keyword."
                : "There are no herbalists available yet. Check back later."}
            </p>
          </div>
        ) : null}

        {!isLoading && !error && paginatedHerbalists.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedHerbalists.map((herbalist) => (
              <HerbalistFavoriteCard
                key={herbalist.herbalistId}
                herbalist={herbalist}
                isFavorite={favoriteHerbalistIds.has(herbalist.herbalistId)}
                onToggleFavorite={handleToggleFavorite}
                isFavoriteUpdating={favoriteUpdatingIds.has(
                  herbalist.herbalistId,
                )}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && filteredHerbalists.length > HERBALISTS_PER_PAGE ? (
          <div className="mt-8 sm:mt-10">
            <Pagination
              totalItems={filteredHerbalists.length}
              itemsPerPage={HERBALISTS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default HerbalistsPage;
