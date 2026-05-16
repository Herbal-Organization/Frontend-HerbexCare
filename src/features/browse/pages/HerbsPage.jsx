import { useMemo, useState } from "react";
import PatientNavbar from "@components/features/browse/PatientNavbar";
import BrowseFilters from "@components/features/browse/BrowseFilters";
import HerbsGrid from "@components/features/browse/HerbsGrid";
import HerbsPagination from "@components/features/browse/HerbsPagination";
import Footer from "@components/features/landing/Footer";
import useHerbs from "@features/browse/hooks/useHerbs";
import HerbFilters from "@components/features/browse/HerbFilters";

const HERBS_PER_PAGE = 8;

function HerbsPage() {
  const { herbs, isLoading, error, reload } = useHerbs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PatientNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
