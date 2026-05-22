import { useEffect, useMemo, useState } from "react";
import PatientNavbar from "@components/features/browse/PatientNavbar";
import BrowseFilters from "@components/features/browse/BrowseFilters";
import HerbalistFavoriteCard from "@components/features/browse/HerbalistFavoriteCard";
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

const HERBALISTS_PER_PAGE = 8;

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHerbalists.length / HERBALISTS_PER_PAGE),
  );

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PatientNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
              Loading herbalists
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && paginatedHerbalists.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-14 text-center">
            <h2 className="text-xl font-bold text-slate-700">No herbalists found</h2>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or check back later.
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
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default HerbalistsPage;
