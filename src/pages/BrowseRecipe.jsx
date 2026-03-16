import BrowseHeader from "../component/browse/BrowseHeader";
import BrowseFilters from "../component/browse/BrowseFilters";
import RecipesGrid from "../component/browse/RecipesGrid";
import RecipesPagination from "../component/browse/RecipesPagination";
import Footer from "../component/Footer";

function BrowseRecipe() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <BrowseHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrowseFilters />
        <RecipesGrid />
        <RecipesPagination />
      </main>
      <Footer />
    </div>
  );
}

export default BrowseRecipe;
