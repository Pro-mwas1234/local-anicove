Version: 1.0.0

# API Documentation

The LocalLink platform features a native Node.js Express backend that proxies requests to Anilist's GraphQL API and Miruro's secure pipe endpoints.

## Base URL
All API requests are relative to `/api` (e.g., `http://localhost:3000/api`).

---

## Endpoints

### 1. Discovery & Search

#### `GET /api/search`
Search for anime by title.
- **Parameters**: `query` (string, required)
- **Response**: `{ results: [...], page: 1 }`

#### `GET /api/suggestions`
Get search autocomplete suggestions.
- **Parameters**: `query` (string, required)
- **Response**: `{ suggestions: [...] }`

#### `GET /api/filter`
Advanced filtering and sorting.
- **Parameters**: `genre`, `sort`, `page`
- **Response**: `{ results: [...], hasNextPage: boolean }`

---

### 2. Collections

These endpoints return paginated lists of anime for specific categories.

- `GET /api/trending`
- `GET /api/popular`
- `GET /api/upcoming`
- `GET /api/recent`
- `GET /api/spotlight`
- `GET /api/schedule`

**Response**: `{ results: [...], page: 1 }`

---

### 3. Anime Details

#### `GET /api/info/:anilist_id`
Get full metadata for a specific anime.

#### `GET /api/anime/:anilist_id/characters`
Get character data.

#### `GET /api/anime/:anilist_id/relations`
Get related media (prequels, sequels).

#### `GET /api/anime/:anilist_id/recommendations`
Get similar anime recommendations.

---

### 4. Streaming (Pipe API)

#### `GET /api/episodes/:anilist_id`
Retrieve available streaming providers and episode lists for an anime.
- **Response**: `{ providers: { kiwi: { episodes: { sub: [...] } } } }`

#### `GET /api/watch/:provider/:anilist_id/:category/:slug`
Get the stream manifest (m3u8) for a specific episode.
- **Parameters**:
  - `provider`: e.g., `kiwi`
  - `anilist_id`: e.g., `178005`
  - `category`: `sub` or `dub`
  - `slug`: e.g., `ep-1`
- **Response**: `{ streams: [{ url: "...", type: "hls" }] }`
