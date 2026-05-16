import { useEffect, useMemo, useState } from "react";
import PatientNavbar from "@components/features/browse/PatientNavbar";
import BrowseFilters from "@components/features/browse/BrowseFilters";
import RecipeFilters from "@components/features/browse/RecipeFilters";
import RecipesGrid from "@components/features/browse/RecipesGrid";
import RecipesPagination from "@components/features/browse/RecipesPagination";
import Footer from "@components/features/landing/Footer";
import useRecipes from "@features/browse/hooks/useRecipes";
import { filterRecipes } from "@features/browse/services/recipes";
import { getMyRecipesFavorites, toggleFavorite } from "@api/favorites";
import { toast } from "react-hot-toast";

const RECIPES_PER_PAGE = 8;

function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(new Set());
  const [favoriteUpdatingRecipeIds, setFavoriteUpdatingRecipeIds] = useState(
    new Set(),
  );
  const { recipes, isLoading, error, reload } = useRecipes();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await getMyRecipesFavorites();
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
              Number(item?.recipeId || item?.id || item?.targetId || 0),
            )
            .filter(Boolean),
        );
        setFavoriteRecipeIds(ids);
      } catch {
        setFavoriteRecipeIds(new Set());
      }
    };

    loadFavorites();
  }, []);

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

  const handleToggleRecipeFavorite = async (recipeId) => {
    const id = Number(recipeId || 0);
    if (!id) return;

    const isBusy = favoriteUpdatingRecipeIds.has(id);
    if (isBusy) return;

    setFavoriteUpdatingRecipeIds((current) => new Set(current).add(id));

    try {
      await toggleFavorite({
        targetId: id,
        type: "Recipe",
      });

      setFavoriteRecipeIds((current) => {
        const next = new Set(current);
        const wasFavorite = next.has(id);
        if (wasFavorite) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      const wasFavorite = favoriteRecipeIds.has(id);
      toast.success(
        wasFavorite
          ? "Recipe removed from favorites."
          : "Recipe added to favorites.",
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Unable to update favorite recipe.";
      toast.error(message);
    } finally {
      setFavoriteUpdatingRecipeIds((current) => {
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
          favoriteRecipeIds={favoriteRecipeIds}
          onToggleRecipeFavorite={handleToggleRecipeFavorite}
          favoriteUpdatingRecipeIds={favoriteUpdatingRecipeIds}
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
