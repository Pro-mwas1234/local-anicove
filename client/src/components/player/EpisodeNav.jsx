export default function EpisodeNav({ onPrev, onNext, hasPrev, hasNext }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          hasPrev
            ? "bg-surface-base border border-surface-border text-text-primary hover:bg-surface-raised"
            : "bg-surface-base/50 text-text-muted cursor-not-allowed"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          hasNext
            ? "bg-netflix-red text-white hover:bg-netflix-red-hover"
            : "bg-surface-base/50 text-text-muted cursor-not-allowed"
        }`}
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
