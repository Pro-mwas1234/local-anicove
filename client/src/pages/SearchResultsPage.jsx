import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeGrid from "../components/anime/AnimeGrid";
import { searchAnime } from "../services/api";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    let cancelled = false;
    setLoading(true);

    searchAnime(query, page)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results || []);
          setHasNext(data.hasNextPage || false);
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query, page]);

  return (
    <div id="search-results-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen">
      <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-2">
        Search Results
      </h1>
      {query && (
        <p className="text-text-secondary mb-8">
          Showing results for "<span className="text-text-primary font-medium">{query}</span>"
        </p>
      )}

      <AnimeGrid
        anime={results}
        loading={loading}
        emptyMessage={query ? "No anime found for this search." : "Enter a search query to find anime."}
      />

      {/* Pagination */}
      {!loading && results.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              page === 1
                ? "bg-surface-base text-text-muted cursor-not-allowed"
                : "bg-surface-base border border-surface-border text-text-primary hover:bg-surface-raised"
            }`}
          >
            Previous
          </button>
          <span className="text-text-secondary text-sm">Page {page}</span>
          <button
            onClick={() => hasNext && setPage((p) => p + 1)}
            disabled={!hasNext}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              !hasNext
                ? "bg-surface-base text-text-muted cursor-not-allowed"
                : "bg-netflix-red text-white hover:bg-netflix-red-hover"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
