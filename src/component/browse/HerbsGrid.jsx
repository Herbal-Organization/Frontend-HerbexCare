import HerbCard from "./HerbCard";

function HerbsGrid({ herbs, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading herbs...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-800">Unable to load herbs</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!herbs || herbs.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-600">
          No herbs found
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {herbs.map((herb) => (
        <HerbCard key={herb.id || herb.herbId} herb={herb} />
      ))}
    </div>
  );
}

export default HerbsGrid;
