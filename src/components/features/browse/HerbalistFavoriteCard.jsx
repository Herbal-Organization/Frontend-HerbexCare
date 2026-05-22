import { FaHeart, FaRegHeart, FaStar, FaUserMd } from "react-icons/fa";

function HerbalistFavoriteCard({
  herbalist,
  isFavorite = false,
  onToggleFavorite,
  isFavoriteUpdating = false,
}) {
  const id = herbalist?.herbalistId;
  const rating =
    herbalist?.averageRating != null && Number.isFinite(herbalist.averageRating)
      ? Number(herbalist.averageRating).toFixed(1)
      : null;

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || isFavoriteUpdating || !id) return;
    onToggleFavorite(id);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-[#EAF3DE] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#3B6D11] shadow-sm">
            <FaUserMd className="text-xl" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#27500A]">
              {herbalist.fullName}
            </h3>
            {herbalist.licenseNumber ? (
              <p className="truncate text-xs font-medium text-[#3B6D11]/80">
                License: {herbalist.licenseNumber}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={isFavoriteUpdating}
          aria-label={
            isFavorite ? "Remove herbalist from favorites" : "Add herbalist to favorites"
          }
          className="shrink-0 rounded-full p-2 text-rose-500 transition hover:bg-white/80 disabled:opacity-50"
        >
          {isFavorite ? (
            <FaHeart className="text-lg" />
          ) : (
            <FaRegHeart className="text-lg" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {rating ? (
          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <FaStar className="text-amber-500" />
            {rating}
          </div>
        ) : null}

        {herbalist.bio ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {herbalist.bio}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400">No bio provided yet.</p>
        )}

        {herbalist.availableFrom && herbalist.availableTo ? (
          <p className="mt-auto text-xs font-medium text-slate-500">
            Available {herbalist.availableFrom} – {herbalist.availableTo}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default HerbalistFavoriteCard;
