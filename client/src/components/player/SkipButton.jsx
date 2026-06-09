export default function SkipButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-4 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-lg border border-white/30 transition-all hover:scale-105 animate-fade-in"
      style={{
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      {label} →
    </button>
  );
}
