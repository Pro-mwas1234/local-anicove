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

// AniList Media List Statuses for tracking
export const ANILIST_MEDIA_STATUS = [
  { value: "CURRENT", label: "Watching", color: "bg-blue-500" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-500" },
  { value: "PAUSED", label: "On Hold", color: "bg-yellow-500" },
  { value: "DROPPED", label: "Dropped", color: "bg-red-500" },
  { value: "PLANNING", label: "Plan to Watch", color: "bg-gray-500" },
  { value: "REPEATING", label: "Rewatching", color: "bg-purple-500" },
];

export const ANILIST_LIST_STATUS_MAP = {
  CURRENT: "Watching",
  COMPLETED: "Completed",
  PAUSED: "On Hold",
  DROPPED: "Dropped",
  PLANNING: "Plan to Watch",
  REPEATING: "Rewatching",
};
