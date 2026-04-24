import { useMemo, useState } from "react";
import PatientNavbar from "../../components/browse/PatientNavbar";
import BrowseFilters from "../../components/browse/BrowseFilters";
import RecipesGrid from "../../components/browse/RecipesGrid";
import RecipesPagination from "../../components/browse/RecipesPagination";
import Footer from "../../components/landing/Footer";
import useRecipes from "../../hooks/useRecipes";
import { filterRecipes } from "../../services/recipes";

const RECIPES_PER_PAGE = 8;

function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { recipes, isLoading, error, reload } = useRecipes();

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, searchTerm),
    [recipes, searchTerm],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE),
  );
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE,
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
          title="Recipe Library"
          description="Browse every recipe returned by the recipes endpoint and search instantly."
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          resultCount={filteredRecipes.length}
          resultLabel={`recipe${filteredRecipes.length === 1 ? "" : "s"} available`}
          placeholder="Search recipes, herbs, or conditions..."
        />
        <RecipesGrid
          recipes={paginatedRecipes}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
        />
        <RecipesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemCount={filteredRecipes.length}
          onPageChange={setCurrentPage}
        />
      </main>
      <Footer />
    </div>
  );
}

export default RecipesPage;
