import { useMemo, useState } from "react";
import PatientNavbar from "../../components/browse/PatientNavbar";
import BrowseFilters from "../../components/browse/BrowseFilters";
import RecipeFilters from "../../components/browse/RecipeFilters";
import RecipesGrid from "../../components/browse/RecipesGrid";
import RecipesPagination from "../../components/browse/RecipesPagination";
import Footer from "../../components/landing/Footer";
import useRecipes from "../../hooks/useRecipes";
import { filterRecipes } from "../../services/recipes";

const RECIPES_PER_PAGE = 8;

function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { recipes, isLoading, error, reload } = useRecipes();

  const availableDiseases = useMemo(() => {
    const diseaseNames = new Set();

    recipes.forEach((recipe) => {
      recipe.targetedDiseases?.forEach((disease) => {
        if (disease?.diseaseName) {
          diseaseNames.add(disease.diseaseName);
        }
      });
    });

    return Array.from(diseaseNames).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let result = filterRecipes(recipes, searchTerm);
    const parsedMin = minPrice === "" ? null : Number(minPrice);
    const parsedMax = maxPrice === "" ? null : Number(maxPrice);
    const hasMin = parsedMin != null && !Number.isNaN(parsedMin);
    const hasMax = parsedMax != null && !Number.isNaN(parsedMax);

    if (statusFilter === "active") {
      result = result.filter((recipe) => recipe.isActive !== false);
    } else if (statusFilter === "inactive") {
      result = result.filter((recipe) => recipe.isActive === false);
    }

    if (selectedDiseases.length > 0) {
      result = result.filter((recipe) =>
        selectedDiseases.some((name) =>
          recipe.targetedDiseases?.some(
            (disease) => disease?.diseaseName === name,
          ),
        ),
      );
    }

    if (hasMin) {
      result = result.filter(
        (recipe) => Number(recipe.price ?? 0) >= parsedMin,
      );
    }

    if (hasMax) {
      result = result.filter(
        (recipe) => Number(recipe.price ?? 0) <= parsedMax,
      );
    }

    return result;
  }, [recipes, searchTerm, selectedDiseases, statusFilter, minPrice, maxPrice]);

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

  const handleDiseaseChange = (diseaseName) => {
    setSelectedDiseases((current) =>
      current.includes(diseaseName)
        ? current.filter((name) => name !== diseaseName)
        : [...current, diseaseName],
    );
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDiseases([]);
    setStatusFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() ||
    selectedDiseases.length > 0 ||
    statusFilter !== "all" ||
    minPrice !== "" ||
    maxPrice !== "";

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
        <RecipeFilters
          availableDiseases={availableDiseases}
          selectedDiseases={selectedDiseases}
          onDiseaseChange={handleDiseaseChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={handleMinPriceChange}
          onMaxPriceChange={handleMaxPriceChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
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
