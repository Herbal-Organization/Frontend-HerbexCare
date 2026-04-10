import { useMemo, useState } from "react";
import PatientNavbar from "../component/browse/PatientNavbar";
import BrowseFilters from "../component/browse/BrowseFilters";
import HerbsGrid from "../component/browse/HerbsGrid";
import Footer from "../component/Footer";
import useHerbs from "../hooks/useHerbs";

function HerbsPage() {
  const { herbs, isLoading, error, reload } = useHerbs();
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PatientNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrowseFilters
          title="Herb Library"
          description="Search the herb database by herb name, scientific name, benefits, or description."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={filteredHerbs.length}
          resultLabel={`herb${filteredHerbs.length === 1 ? "" : "s"} available`}
          placeholder="Search herbs by name, scientific name, or benefits..."
        />

        <HerbsGrid
          herbs={filteredHerbs}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
        />
      </main>
      <Footer />
    </div>
  );
}

export default HerbsPage;
