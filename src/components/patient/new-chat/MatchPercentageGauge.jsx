import React from "react";

const MatchPercentageGauge = ({ percentage = 0 }) => {
  // SVG circular gauge logic
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 10) * circumference; // wait, percentage is 0-10 or 0-100? The example gave `matchPercentage: 9`. Let's assume out of 10.
  
  // Actually, wait, "matchPercentage" usually means 0-100. If the example is `9`, it might be 9%, but wait! "Golden Milk - 6%". So 9 might actually mean 9%, or maybe the AI returned 9 out of 100 but meant 9%. 
  // Let's normalize it to a 0-100 scale regardless. Let's just pass `value` and calculate safely. Let's treat it as a 0-100 percentage.
  
  const displayValue = Math.min(Math.max(percentage, 0), 100);
  const actualDashoffset = circumference - (displayValue / 100) * circumference;

  let colorClass = "text-red-500";
  if (displayValue >= 70) colorClass = "text-green-500";
  else if (displayValue >= 40) colorClass = "text-yellow-500";

  return (
    <div className="flex flex-col items-center justify-center relative w-20 h-20">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-200"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset: actualDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${colorClass}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex items-center justify-center inset-0">
        <span className="text-sm font-bold text-slate-700">{displayValue}%</span>
      </div>
    </div>
  );
};

export default MatchPercentageGauge;
