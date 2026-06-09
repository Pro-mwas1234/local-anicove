export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-surface-raised text-text-secondary",
    red: "bg-netflix-red text-white",
    outline: "border border-surface-border text-text-secondary",
    genre: "bg-surface-base text-text-secondary hover:bg-surface-raised hover:text-text-primary cursor-pointer",
  };

  return (
    <span
      className={`inline-block rounded px-3 py-1 text-xs font-bold tracking-wide uppercase ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
