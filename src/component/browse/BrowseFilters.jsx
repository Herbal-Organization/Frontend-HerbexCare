import {
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { MdCategory, MdMedicalServices, MdRestaurant } from "react-icons/md";

function BrowseFilters() {
  return (
    <section className="mb-10">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 ">
            Discover Natural Remedies
          </h2>
          <p className="text-slate-600  mt-1">
            Explore AI-curated herbal recipes for your wellness journey.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-white  border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Search herbal recipes..."
              type="text"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <button className="flex items-center gap-2 px-4 py-3 bg-white  border border-slate-200  rounded-xl text-sm font-medium hover:border-primary transition-all">
              <MdCategory className="text-primary text-lg" />
              <span>Category</span>
              <FiChevronDown className="text-slate-400 text-lg" />
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white  border border-slate-200  rounded-xl text-sm font-medium hover:border-primary transition-all">
              <MdMedicalServices className="text-primary text-lg" />
              <span>Ailment</span>
              <FiChevronDown className="text-slate-400 text-lg" />
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white  border border-slate-200  rounded-xl text-sm font-medium hover:border-primary transition-all">
              <MdRestaurant className="text-primary text-lg" />
              <span>Ingredients</span>
              <FiChevronDown className="text-slate-400 text-lg" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrowseFilters;

