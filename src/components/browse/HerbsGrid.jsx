import { motion } from "motion/react";
import HerbCard from "./HerbCard";
import Skeleton from "react-loading-skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

function HerbsGrid({ herbs, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="grid gap-8 px-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`herb-skeleton-${index}`}
            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm"
          >
            <div className="relative">
              <Skeleton
                height={160}
                containerClassName="block w-full"
                baseColor="#d9e6cd"
                highlightColor="#edf5e6"
              />
              <Skeleton
                width={84}
                height={24}
                borderRadius={9999}
                containerClassName="absolute right-3 top-3"
                baseColor="#d9e6cd"
                highlightColor="#edf5e6"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 w-full">
              <div>
                <Skeleton
                  height={18}
                  width="65%"
                  containerClassName="block w-full"
                />
                <Skeleton
                  height={12}
                  width="48%"
                  className="mt-2"
                  containerClassName="block w-full"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Skeleton width={62} height={22} borderRadius={9999} />
                <Skeleton width={72} height={22} borderRadius={9999} />
                <Skeleton width={52} height={22} borderRadius={9999} />
              </div>
              <Skeleton
                count={2}
                className="mt-1"
                containerClassName="block w-full"
              />
              <div className="mt-auto pt-3 flex items-center justify-between">
                <Skeleton
                  width={92}
                  height={30}
                  borderRadius={8}
                  containerClassName="block"
                />
                <Skeleton
                  width={32}
                  height={32}
                  borderRadius={8}
                  containerClassName="block"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-4xl border border-red-100 bg-red-50 p-16 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <h2 className="text-xl font-extrabold text-red-800">
          Unable to load herbs
        </h2>
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-8 rounded-full bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-700 hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!herbs || herbs.length === 0) {
    return (
      <div className="rounded-4xl border border-slate-200 bg-white p-16 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <div className="text-6xl mb-6">🌿</div>
        <h3 className="text-2xl font-bold text-slate-800">No herbs found</h3>
        <p className="mt-2 text-slate-500 font-medium">
          Try adjusting your search criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pb-12"
    >
      {herbs.map((herb) => (
        <HerbCard key={herb.id || herb.herbId} herb={herb} />
      ))}
    </motion.div>
  );
}

export default HerbsGrid;
