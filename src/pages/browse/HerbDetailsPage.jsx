import { useState, useMemo, useEffect } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaStamp,
  FaUserMd,
  FaTags,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import PatientNavbar from "../../components/browse/PatientNavbar";
import Footer from "../../components/landing/Footer";
import useHerbDetails from "../../hooks/useHerbDetails";
import { useCart } from "../../context/CartContext";
import { getHerbalistById } from "../../api/herbalists";

/* ── Add to cart form ── */
function AddToCartForm({ providers, herb }) {
  const { addHerbToCart } = useCart();
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedHerbalistProfile, setSelectedHerbalistProfile] =
    useState(null);

  const getProviderId = (provider) =>
    String(provider?.herbalistId ?? provider?.userId ?? provider?.id ?? "");

  const getProviderName = (provider) =>
    provider?.herbalistName ||
    provider?.fullName ||
    provider?.name ||
    provider?.userName ||
    provider?.username ||
    "Licensed Herbalist";

  const getProviderPricePerKilo = (provider) => {
    const value =
      provider?.pricePerKilo ??
      provider?.price ??
      provider?.inventoryPricePerKilo ??
      provider?.inventoryPrice;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Sort providers by price (ascending - best price first)
  const sortedProviders = useMemo(() => {
    return [...(providers || [])].sort((a, b) => {
      const priceA = getProviderPricePerKilo(a) || Infinity;
      const priceB = getProviderPricePerKilo(b) || Infinity;
      return priceA - priceB;
    });
  }, [providers]);

  // Get selected provider data
  const selectedProvider = useMemo(
    () =>
      sortedProviders.find(
        (p) => getProviderId(p) === String(selectedProviderId),
      ),
    [selectedProviderId, sortedProviders],
  );

  useEffect(() => {
    const loadSelectedHerbalist = async () => {
      if (!selectedProviderId) {
        setSelectedHerbalistProfile(null);
        return;
      }

      try {
        const profile = await getHerbalistById(selectedProviderId);
        setSelectedHerbalistProfile(profile || null);
      } catch (_error) {
        setSelectedHerbalistProfile(null);
      }
    };

    loadSelectedHerbalist();
  }, [selectedProviderId]);

  const resolvedProviderName =
    selectedHerbalistProfile?.fullName ||
    selectedHerbalistProfile?.name ||
    selectedHerbalistProfile?.userName ||
    getProviderName(selectedProvider);

  const handleAdd = () => {
    if (!selectedProviderId) {
      toast.error("Please select a herbalist");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!selectedProvider) return;

    const pricePerKilo = getProviderPricePerKilo(selectedProvider);

    addHerbToCart({
      herbId: herb.herbId || herb.id,
      herbalistId: getProviderId(selectedProvider),
      quantityPerGram: qty,
      pricePerKilo: pricePerKilo,
      totalPrice: (pricePerKilo * qty) / 1000,
      _previewName: herb.herbName,
      _providerName: resolvedProviderName,
    });

    toast.success("Added to cart!");
    setQuantity("");
    setSelectedProviderId("");
  };

  const estimatedTotal = (() => {
    if (!selectedProvider || !quantity) return 0;

    const grams = Number(quantity);
    const pricePerKilo = getProviderPricePerKilo(selectedProvider);

    if (!Number.isFinite(grams) || grams <= 0 || !pricePerKilo) return 0;

    return (grams / 1000) * pricePerKilo;
  })();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#EAF3DE] flex items-center justify-center shrink-0">
          <FaTags className="text-[#3B6D11] text-sm" />
        </div>
        <h2 className="text-sm font-medium text-slate-900">Add to cart</h2>
      </div>

      <div className="space-y-4">
        {/* Herbalist selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select herbalist
          </label>
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#3B6D11] focus:ring-2 focus:ring-[#3B6D11]/10 transition appearance-none cursor-pointer"
          >
            <option value="">
              {sortedProviders.length > 0
                ? "Choose the best price..."
                : "No herbalists available"}
            </option>
            {sortedProviders.map((p) => {
              const providerId = getProviderId(p);
              const providerName = getProviderName(p);
              const providerPricePerKilo = getProviderPricePerKilo(p);
              const price = providerPricePerKilo
                ? `${providerPricePerKilo} EGP/kg`
                : "Price N/A";
              const rating = p.averageRating
                ? ` (${Number(p.averageRating).toFixed(1)} ★)`
                : "";

              return (
                <option key={providerId} value={providerId}>
                  {providerName} • {price}
                  {rating}
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected provider details */}
        {selectedProvider && (
          <div className="p-3 bg-[#EAF3DE] rounded-lg border border-[#C0DD97]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#3B6D11] uppercase tracking-wider">
                Selected provider
              </span>
              {selectedProvider.averageRating && (
                <span className="text-[11px] font-medium bg-white text-[#633806] border border-[#EF9F27] border-opacity-50 rounded px-2 py-0.5">
                  {Number(selectedProvider.averageRating).toFixed(1)} ★
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#27500A] mb-1">
              {resolvedProviderName}
            </p>
            <p className="text-sm font-bold text-[#3B6D11]">
              {getProviderPricePerKilo(selectedProvider)
                ? `${getProviderPricePerKilo(selectedProvider)} EGP/kg`
                : "Price N/A"}
            </p>
          </div>
        )}

        {/* Quantity input */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Quantity (grams)
          </label>
          <input
            type="number"
            min="1"
            step="50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 100, 250, 500..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-[#3B6D11] focus:ring-2 focus:ring-[#3B6D11]/10 transition"
          />
        </div>

        {/* Price breakdown */}
        {selectedProvider && quantity && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600 font-medium">
                Unit price:
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {getProviderPricePerKilo(selectedProvider)} EGP/kg
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600 font-medium">
                Quantity:
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {quantity}g
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Total:
              </span>
              <span className="text-lg font-bold text-[#3B6D11]">
                {estimatedTotal.toFixed(2)} EGP
              </span>
            </div>
          </div>
        )}

        {/* Add button */}
        <button
          type="button"
          disabled={
            !selectedProviderId ||
            !quantity ||
            Number(quantity) <= 0 ||
            !getProviderPricePerKilo(selectedProvider)
          }
          onClick={handleAdd}
          className="w-full rounded-lg bg-[#3B6D11] text-white px-4 py-3 text-sm font-semibold transition hover:bg-[#2d5209] disabled:opacity-40 disabled:pointer-events-none uppercase tracking-wider"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

/* ── Section card wrapper ── */
function SectionCard({ title, icon, iconBg = "bg-slate-100", children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div
          className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <h2 className="text-sm font-medium text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

function HerbDetailsPage() {
  const { herbId } = useParams();
  const { herb, providers, isLoading, error, reload } = useHerbDetails(herbId);

  const uniqueProviders = useMemo(() => {
    const seen = new Set();
    return (providers || []).filter((p) => {
      const id = p?.herbalistId ?? p?.userId ?? p?.id;
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [providers]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientNavbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">
        <Link
          to="/patient/home/herbs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 mb-8 hover:text-[#3B6D11] transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to herbs
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden grid lg:grid-cols-[340px_1fr]">
              <div className="min-h-70 bg-[#EAF3DE] p-8">
                <Skeleton height="100%" borderRadius={24} />
              </div>
              <div className="p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Skeleton width={110} height={24} borderRadius={9999} />
                  <Skeleton width={128} height={24} borderRadius={9999} />
                </div>
                <Skeleton height={54} width="70%" />
                <Skeleton height={18} width="35%" />
                <Skeleton count={3} />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] items-start">
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`herb-details-left-${index}`}
                    className="rounded-2xl border border-slate-100 bg-white p-6"
                  >
                    <Skeleton width="30%" height={18} className="mb-5" />
                    <Skeleton count={index === 0 ? 3 : 2} />
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="28%" height={18} className="mb-5" />
                  <div className="space-y-4">
                    <Skeleton height={56} />
                    <Skeleton height={56} />
                    <Skeleton height={56} />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                  <Skeleton width="30%" height={18} className="mb-5" />
                  <Skeleton count={4} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-14 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">
              Unable to load herb details
            </h2>
            <p className="text-sm text-red-500 mb-7">{error}</p>
            <button
              onClick={reload}
              className="rounded-full bg-red-600 text-white text-sm font-medium px-6 py-2.5 hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && herb && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* Hero */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-slate-100 bg-white overflow-hidden grid lg:grid-cols-[340px_1fr]"
            >
              {/* Image panel */}
              <div className="relative bg-[#EAF3DE] min-h-70 flex items-center justify-center">
                {herb.imageURL ? (
                  <img
                    src={herb.imageURL}
                    alt={herb.herbName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="opacity-15"
                    width="120"
                    height="155"
                    viewBox="0 0 120 155"
                    fill="none"
                  >
                    <path
                      d="M60 3C95 38 105 100 60 152C15 100 25 38 60 3Z"
                      fill="#3B6D11"
                    />
                    <line
                      x1="60"
                      y1="3"
                      x2="60"
                      y2="152"
                      stroke="#3B6D11"
                      strokeWidth="2"
                    />
                    <line
                      x1="60"
                      y1="55"
                      x2="35"
                      y2="78"
                      stroke="#3B6D11"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="60"
                      y1="78"
                      x2="85"
                      y2="100"
                      stroke="#3B6D11"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="60"
                      y1="100"
                      x2="32"
                      y2="118"
                      stroke="#3B6D11"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </div>

              {/* Info panel */}
              <div className="p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-500 rounded-full px-3 py-1">
                    Herb document
                  </span>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wider rounded-full px-3 py-1 border ${
                      herb.isApproved
                        ? "bg-[#EAF3DE] text-[#27500A] border-[#97C459]"
                        : "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]"
                    }`}
                  >
                    {herb.isApproved ? "Approved" : "Pending approval"}
                  </span>
                </div>

                <h1 className="text-4xl text-slate-900 leading-tight mb-2">
                  {herb.herbName}
                </h1>
                <p className="text-base italic text-slate-400 mb-5">
                  {herb.scientificName}
                </p>
                <p className="text-sm leading-relaxed text-slate-500 max-w-lg">
                  {herb.description || "No description provided."}
                </p>
              </div>
            </motion.div>

            {/* Body grid */}
            <motion.div
              variants={itemVariants}
              className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] items-start"
            >
              {/* Left column */}
              <div className="space-y-5">
                <SectionCard
                  title="Primary benefits"
                  icon={<FaCheckCircle className="text-[#3B6D11] text-sm" />}
                  iconBg="bg-[#EAF3DE]"
                >
                  <p className="text-sm leading-relaxed text-slate-600 mb-4">
                    {herb.benefits || "No specific benefits noted."}
                  </p>
                  {herb.benefitList?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {herb.benefitList.map((b) => (
                        <span
                          key={b}
                          className="text-[11px] font-medium bg-[#EAF3DE] text-[#3B6D11] border border-[#C0DD97] rounded-full px-3 py-1"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Dosage guidance"
                  icon={<FaLeaf className="text-slate-500 text-sm" />}
                >
                  <p className="text-sm leading-relaxed text-slate-600">
                    {herb.dosage ||
                      "Consult your herbalist for proper dosage instructions."}
                  </p>
                </SectionCard>

                <SectionCard
                  title="Warnings & cautions"
                  icon={
                    <FaExclamationTriangle className="text-[#854F0B] text-sm" />
                  }
                  iconBg="bg-[#FAEEDA]"
                >
                  <div className="rounded-xl bg-[#FAEEDA] border border-[#EF9F27]/40 p-4">
                    <p className="text-sm leading-relaxed text-[#412402]">
                      {herb.warnings ||
                        "No explicit warnings listed. Always consult a professional before use."}
                    </p>
                  </div>
                </SectionCard>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <AddToCartForm providers={uniqueProviders} herb={herb} />

                <SectionCard
                  title="Record details"
                  icon={<FaStamp className="text-slate-500 text-sm" />}
                >
                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        label: "Approval status",
                        value:
                          herb.isApproved == null
                            ? "Under review"
                            : herb.isApproved
                              ? "Officially approved"
                              : "Pending approval",
                        pill: herb.isApproved,
                      },
                    ].map(({ label, value, pill }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                          {label}
                        </span>
                        {pill != null ? (
                          <span
                            className={`text-[11px] font-medium rounded-full px-3 py-1 border ${
                              pill
                                ? "bg-[#EAF3DE] text-[#27500A] border-[#97C459]"
                                : "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]"
                            }`}
                          >
                            {value}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-700">
                            {value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default HerbDetailsPage;
