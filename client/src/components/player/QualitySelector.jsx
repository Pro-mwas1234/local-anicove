export default function QualitySelector({ qualities, current, onChange }) {
  if (!qualities || qualities.length === 0) return null;

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-base border border-surface-border text-text-primary text-sm rounded-lg px-4 py-2 outline-none cursor-pointer focus:border-netflix-red transition-colors"
      id="quality-selector"
    >
      {qualities.map((q) => (
        <option key={q.value} value={q.value}>
          {q.label}
        </option>
      ))}
    </select>
  );
}
