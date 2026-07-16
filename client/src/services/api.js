import { API_BASE } from "../utils/constants";

async function fetchJSON(endpoint, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(customHeaders || {}),
    },
    ...restOptions,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Search & Discovery
export const searchAnime = (query, page = 1, filters = {}) => {
  const params = new URLSearchParams({ query, page });
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.format) params.set("format", filters.format);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.include_adult) params.set("include_adult", filters.include_adult);
  return fetchJSON(`/search?${params.toString()}`);
};

export const getSuggestions = (query) =>
  fetchJSON(`/suggestions?query=${encodeURIComponent(query)}`);

export const filterAnime = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return fetchJSON(`/filter?${searchParams.toString()}`);
};

export const getTrending = (page = 1, perPage = 20, includeAdult = false) =>
  fetchJSON(`/trending?page=${page}&per_page=${perPage}${includeAdult ? "&include_adult=true" : ""}`);

export const getPopular = (page = 1, perPage = 20, includeAdult = false) =>
  fetchJSON(`/popular?page=${page}&per_page=${perPage}${includeAdult ? "&include_adult=true" : ""}`);

export const getUpcoming = (page = 1, perPage = 20, includeAdult = false) =>
  fetchJSON(`/upcoming?page=${page}&per_page=${perPage}${includeAdult ? "&include_adult=true" : ""}`);

export const getRecent = (page = 1, perPage = 20, includeAdult = false) =>
  fetchJSON(`/recent?page=${page}&per_page=${perPage}${includeAdult ? "&include_adult=true" : ""}`);

export const getSpotlight = (includeAdult = false) =>
  fetchJSON(`/spotlight${includeAdult ? "?include_adult=true" : ""}`);

export const getSchedule = (includeAdult = false) =>
  fetchJSON(`/schedule${includeAdult ? "?include_adult=true" : ""}`);

export const getWeeklySchedule = (includeAdult = false) =>
  fetchJSON(`/schedule/week${includeAdult ? "?include_adult=true" : ""}`);

// Anime Details
export const getAnimeInfo = (id) => fetchJSON(`/info/${id}`);

export const getCharacters = (id) => fetchJSON(`/anime/${id}/characters`);

export const getRelations = (id) => fetchJSON(`/anime/${id}/relations`);

export const getRecommendations = (id) => fetchJSON(`/anime/${id}/recommendations`);

// Streaming
export const getEpisodes = (anilistId) => fetchJSON(`/episodes/${anilistId}`);

export const getStreams = (watchId) => fetchJSON(`/${watchId}`);

// Skips
export const getSkipTimes = (malId, episode) => fetchJSON(`/skips/${malId}/${episode}`);

// === AniList Auth ===
export const loginAnilist = () => {
  window.location.href = `${API_BASE}/auth/anilist`;
};

export const logoutAnilist = () =>
  fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).then(r => r.json());

export const getAuthUser = () =>
  fetch(`${API_BASE}/auth/me`, { credentials: "include" }).then(r => r.json());

// === AniList User List Management ===

/**
 * Get the user's AniList anime list.
 * @param {Object} options - { status, page, perPage }
 */
export const getAnimeList = (options = {}) => {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.page) params.set("page", options.page);
  if (options.perPage) params.set("perPage", options.perPage);
  return fetchJSON(`/user/animelist?${params.toString()}`);
};

/**
 * Save or update an anime list entry on AniList.
 * @param {Object} data - { mediaId, status, score, progress, notes, ... }
 */
export const saveAnimeListEntry = (data) =>
  fetchJSON("/user/animelist", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Delete an anime from the user's AniList.
 */
export const deleteAnimeListEntry = (mediaId) =>
  fetchJSON(`/user/animelist/${mediaId}`, { method: "DELETE" });

/**
 * Update episode progress on AniList.
 */
export const updateAnimeProgress = (data) =>
  fetchJSON("/user/animelist/progress", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Get user stats from AniList.
 */
export const getUserStats = () => fetchJSON("/user/stats");
