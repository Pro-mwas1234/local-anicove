import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeGrid from "../components/anime/AnimeGrid";
import { filterAnime } from "../services/api";
import { GENRES, FORMATS, STATUSES, SEASONS, SORT_OPTIONS, YEARS } from "../utils/constants";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // Read initial filters from URL params
  const filters = {
    genre: searchParams.get("genre") || "",
    format: searchParams.get("format") || "",
    status: searchParams.get("status") || "",
    season: searchParams.get("season") || "",
    year: searchParams.get("year") || "",
    sort: searchParams.get("sort") || "TRENDING_DESC",
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = { page, per_page: 30 };
    if (filters.genre) params.genre = filters.genre;
    if (filters.format) params.format = filters.format;
    if (filters.status) params.status = filters.status;
    if (filters.season) params.season = filters.season;
    if (filters.year) params.year = filters.year;
    if (filters.sort) params.sort = filters.sort;

    filterAnime(params)
      .then((data) => {
        if (!cancelled) {
          setAnime(data.results || []);
          setHasNext(data.hasNextPage || false);
        }
      })
      .catch((err) => {
        console.error("Browse error:", err);
        if (!cancelled) setAnime([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [searchParams, page]);

  const SelectFilter = ({ label, value, options, onChange }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-base border border-surface-border text-text-primary text-sm rounded-lg px-3 py-2.5 outline-none focus:border-netflix-red transition-colors cursor-pointer"
      >
        <option value="">All</option>
        {options.map((opt) =>
          typeof opt === "object" ? (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>
    </div>
  );

  return (
    <div id="browse-page" className="pt-24 px-5 lg:px-24 pb-16 min-h-screen">
      <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-8">
        Browse Anime
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-10 p-5 bg-surface-base rounded-xl border border-surface-border">
        <SelectFilter
          label="Genre"
          value={filters.genre}
          options={GENRES}
          onChange={(v) => updateFilter("genre", v)}
        />
        <SelectFilter
          label="Format"
          value={filters.format}
          options={FORMATS}
          onChange={(v) => updateFilter("format", v)}
        />
        <SelectFilter
          label="Status"
          value={filters.status}
          options={STATUSES}
          onChange={(v) => updateFilter("status", v)}
        />
        <SelectFilter
          label="Season"
          value={filters.season}
          options={SEASONS}
          onChange={(v) => updateFilter("season", v)}
        />
        <SelectFilter
          label="Year"
          value={filters.year}
          options={YEARS}
          onChange={(v) => updateFilter("year", v)}
        />
        <SelectFilter
          label="Sort By"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(v) => updateFilter("sort", v)}
        />
      </div>

      {/* Results */}
      <AnimeGrid
        anime={anime}
        loading={loading}
        emptyMessage="No anime found matching your filters."
      />

      {/* Pagination */}
      {!loading && anime.length > 0 && (
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
