import { useState, useEffect } from "react";
import { FaLeaf, FaSpinner, FaSearch } from "react-icons/fa";
import { getAllCatalogs } from "../../../../api/aiConsultations";

function HerbCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedHerb, setSelectedHerb] = useState(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await getAllCatalogs();
      setCatalog(data || []);
    } catch (error) {
      console.error("Failed to load catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHerbs = catalog.filter(
    (herb) =>
      herb.name?.toLowerCase().includes(search.toLowerCase()) ||
      herb.benefits?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-lg">
            <FaLeaf className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Herb Catalog</h1>
            <p className="text-slate-600">
              Browse our collection of medicinal herbs
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search herbs by name or benefits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="text-4xl text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHerbs.length > 0 ? (
            filteredHerbs.map((herb) => (
              <div
                key={herb.id}
                className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                onClick={() => setSelectedHerb(herb)}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {herb.name}
                  </h3>
                  {herb.latinName && (
                    <p className="text-xs text-slate-500 italic">
                      {herb.latinName}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {herb.benefits && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                        Benefits
                      </p>
                      <p className="text-sm text-slate-700">{herb.benefits}</p>
                    </div>
                  )}

                  {herb.properties && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                        Properties
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {herb.properties.split(",").map((prop, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"
                          >
                            {prop.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {herb.dosage && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-600 mb-1">
                        Dosage
                      </p>
                      <p className="text-sm text-slate-700">{herb.dosage}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-600">
                No herbs found matching your search
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedHerb && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedHerb(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 sticky top-0">
              <h2 className="text-2xl font-bold">{selectedHerb.name}</h2>
              {selectedHerb.latinName && (
                <p className="text-emerald-100 italic">
                  {selectedHerb.latinName}
                </p>
              )}
            </div>

            <div className="p-6 space-y-4">
              {selectedHerb.description && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-700">{selectedHerb.description}</p>
                </div>
              )}

              {selectedHerb.benefits && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Benefits</h3>
                  <p className="text-slate-700">{selectedHerb.benefits}</p>
                </div>
              )}

              {selectedHerb.dosage && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">
                    Recommended Dosage
                  </h3>
                  <p className="text-blue-800">{selectedHerb.dosage}</p>
                </div>
              )}

              {selectedHerb.contraindications && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-900 mb-2">
                    Contraindications
                  </h3>
                  <p className="text-yellow-800">
                    {selectedHerb.contraindications}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedHerb(null)}
                className="w-full mt-6 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HerbCatalog;
