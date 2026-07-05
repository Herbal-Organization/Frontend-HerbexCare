import { useEffect, useMemo, useState } from "react";
import PatientNavbar from "@components/features/browse/PatientNavbar";
import BrowseFilters from "@components/features/browse/BrowseFilters";
import HerbsGrid from "@components/features/browse/HerbsGrid";
import HerbsPagination from "@components/features/browse/HerbsPagination";
import Footer from "@components/features/landing/Footer";
import useHerbs from "@features/browse/hooks/useHerbs";
import HerbFilters from "@components/features/browse/HerbFilters";
import { getMyHerbsFavorites, toggleFavorite } from "@api/favorites";
import { toast } from "react-hot-toast";

const HERBS_PER_PAGE = 8;

function HerbsPage() {
  const { herbs, isLoading, error, reload } = useHerbs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [approvalFilter, setApprovalFilter] = useState("approved");
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteHerbIds, setFavoriteHerbIds] = useState(new Set());
  const [favoriteUpdatingHerbIds, setFavoriteUpdatingHerbIds] = useState(
    new Set(),
  );

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await getMyHerbsFavorites();
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];

        const ids = new Set(
          items
            .map((item) =>
              Number(item?.herbId || item?.id || item?.targetId || 0),
            )
            .filter(Boolean),
        );
        setFavoriteHerbIds(ids);
      } catch {
        setFavoriteHerbIds(new Set());
      }
    };

    loadFavorites();
  }, []);

  // Extract unique benefits from all herbs
  const availableBenefits = useMemo(() => {
    const benefitsSet = new Set();
    herbs.forEach((herb) => {
      herb.benefitList?.forEach((benefit) => {
        benefitsSet.add(benefit);
      });
    });
    return Array.from(benefitsSet).sort();
  }, [herbs]);

  const filteredHerbs = useMemo(() => {
    let result = herbs;

    // Filter by search term
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter((herb) =>
        [
          herb.name,
          herb.herbName,
          herb.scientificName,
          herb.description,
          herb.benefits,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    }

    // Filter by selected benefits
    if (selectedBenefits.length > 0) {
      result = result.filter((herb) =>
        selectedBenefits.some((benefit) => herb.benefitList?.includes(benefit)),
      );
    }

    // Filter by approval status
    if (approvalFilter === "approved") {
      result = result.filter((herb) => herb.isApproved === true);
    } else if (approvalFilter === "pending") {
      result = result.filter((herb) => herb.isApproved !== true);
    }

    return result;
  }, [herbs, searchTerm, selectedBenefits, approvalFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHerbs.length / HERBS_PER_PAGE),
  );

  const paginatedHerbs = filteredHerbs.slice(
    (currentPage - 1) * HERBS_PER_PAGE,
    currentPage * HERBS_PER_PAGE,
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleBenefitChange = (benefit) => {
    setSelectedBenefits((current) =>
      current.includes(benefit)
        ? current.filter((b) => b !== benefit)
        : [...current, benefit],
    );
    setCurrentPage(1);
  };

  const handleApprovalChange = (status) => {
    setApprovalFilter(status);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedBenefits([]);
    setApprovalFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedBenefits.length > 0 || approvalFilter !== "all";

  const handleToggleHerbFavorite = async (herbId) => {
    const id = Number(herbId || 0);
    if (!id) return;

    const isBusy = favoriteUpdatingHerbIds.has(id);
    if (isBusy) return;

    setFavoriteUpdatingHerbIds((current) => new Set(current).add(id));

    try {
      await toggleFavorite({
        targetId: id,
        type: "Herb",
      });

      setFavoriteHerbIds((current) => {
        const next = new Set(current);
        const wasFavorite = next.has(id);
        if (wasFavorite) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      const wasFavorite = favoriteHerbIds.has(id);
      toast.success(
        wasFavorite
          ? "Herb removed from favorites."
          : "Herb added to favorites.",
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update favorite herb.";
      toast.error(message);
    } finally {
      setFavoriteUpdatingHerbIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-emerald-50/50 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
      <PatientNavbar />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BrowseFilters
          title="Herb Library"
          description="Search the herb database by herb name, scientific name, benefits, or description."
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          resultCount={filteredHerbs.length}
          resultLabel={`herb${filteredHerbs.length === 1 ? "" : "s"} available`}
          placeholder="Search herbs by name, scientific name, or benefits..."
        />

        <HerbFilters
          availableBenefits={availableBenefits}
          selectedBenefits={selectedBenefits}
          onBenefitChange={handleBenefitChange}
          approvalFilter={approvalFilter}
          onApprovalChange={handleApprovalChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        <HerbsGrid
          herbs={paginatedHerbs}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          favoriteHerbIds={favoriteHerbIds}
          onToggleHerbFavorite={handleToggleHerbFavorite}
          favoriteUpdatingHerbIds={favoriteUpdatingHerbIds}
        />

        <HerbsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemCount={filteredHerbs.length}
          onPageChange={setCurrentPage}
        />
      </main>
      <Footer />
    </div>
  );
}

export default HerbsPage;
