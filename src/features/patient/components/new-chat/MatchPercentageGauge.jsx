const MatchPercentageGauge = ({ percentage = 0, size = "md" }) => {
  const displayValue = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  const dimensions = size === "sm" ? { radius: 28, stroke: 5 } : { radius: 36, stroke: 6 };
  const { radius, stroke } = dimensions;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (displayValue / 100) * circumference;

  let colorClass = "text-rose-500";
  if (displayValue >= 70) colorClass = "text-emerald-500";
  else if (displayValue >= 40) colorClass = "text-amber-500";

  const boxClass =
    size === "sm" ? "h-16 w-16" : "h-20 w-20 sm:h-[5.5rem] sm:w-[5.5rem]";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${boxClass}`}
      role="img"
      aria-label={`${displayValue}% match`}
    >
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90 transform"
        aria-hidden
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={colorClass}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">
          {displayValue}%
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">
          match
        </span>
      </div>
    </div>
  );
};

export default MatchPercentageGauge;
