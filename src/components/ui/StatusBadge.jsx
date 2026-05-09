import React from 'react';

const statusClasses = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Confirmed: "bg-sky-100 text-sky-800 border-sky-200",
  Preparing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Delivered: "bg-slate-100 text-slate-700 border-slate-200",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

const StatusBadge = ({ status, size = "sm", className = "" }) => {
  const baseClasses = "inline-flex rounded-full border font-bold transition-colors";
  const sizeClasses = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };
  
  const statusClass = statusClasses[status] || statusClasses.Pending;
  const sizeClass = sizeClasses[size] || sizeClasses.sm;
  
  return (
    <span 
      className={`${baseClasses} ${statusClass} ${sizeClass} ${className}`}
      role="status"
      aria-label={`Order status: ${status}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
