import { useMemo, useState } from "react";
import PatientNavbar from "../../components/browse/PatientNavbar";
import BrowseFilters from "../../components/browse/BrowseFilters";
import HerbsGrid from "../../components/browse/HerbsGrid";
import HerbsPagination from "../../components/browse/HerbsPagination";
import Footer from "../../components/landing/Footer";
import useHerbs from "../../hooks/useHerbs";

const HERBS_PER_PAGE = 8;

function HerbsPage() {
  const { herbs, isLoading, error, reload } = useHerbs();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHerbs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return herbs;
    }

    return herbs.filter((herb) =>
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
  }, [herbs, searchTerm]);

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
