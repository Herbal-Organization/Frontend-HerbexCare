function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-32 w-32",
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-primary ${sizes[size] || sizes.md} ${className}`}
    />
  );
}

export default Spinner;
