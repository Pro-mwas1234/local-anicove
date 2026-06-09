export const API_BASE = "/api";

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller", "Mecha", "Music",
];

export const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"];

export const STATUSES = ["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED"];

export const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];

export const SORT_OPTIONS = [
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "POPULARITY_DESC", label: "Popular" },
  { value: "SCORE_DESC", label: "Top Rated" },
  { value: "START_DATE_DESC", label: "Newest" },
];

export const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() + 1 - i
);
