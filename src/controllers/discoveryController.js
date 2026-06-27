const serverCache = require("../config/cache");
const { anilistQuery, MEDIA_LIST_FIELDS } = require("../utils/anilist");

const SORT_MAP = {
  SCORE_DESC: "SCORE_DESC",
  POPULARITY_DESC: "POPULARITY_DESC",
  TRENDING_DESC: "TRENDING_DESC",
  START_DATE_DESC: "START_DATE_DESC",
  FAVOURITES_DESC: "FAVOURITES_DESC",
  UPDATED_AT_DESC: "UPDATED_AT_DESC",
};

exports.getCacheStats = (req, res) => {
  res.json(serverCache.getStats());
};

exports.search = async (req, res) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const { genre, format, status, sort } = req.query;

    const args = ["type: ANIME", "isAdult: false"];
    const variables = { page, perPage };
    const varTypes = ["$page: Int", "$perPage: Int"];

    if (query) {
      args.push("search: $search");
      variables.search = query;
      varTypes.push("$search: String");
    }
    if (sort && SORT_MAP[sort]) {
      args.push(`sort: [${SORT_MAP[sort]}]`);
    } else {
      args.push("sort: SEARCH_MATCH");
    }
    if (genre) {
      args.push("genre: $genre");
      variables.genre = genre;
      varTypes.push("$genre: String");
    }
    if (format) {
      args.push("format: $format");
      variables.format = format.toUpperCase();
      varTypes.push("$format: MediaFormat");
    }
    if (status) {
      args.push("status: $status");
      variables.status = status.toUpperCase();
      varTypes.push("$status: MediaStatus");
    }

    const gql = `
        query (${varTypes.join(", ")}) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total currentPage lastPage hasNextPage perPage }
                media(${args.join(", ")}) {
                    ${MEDIA_LIST_FIELDS}
                }
            }
        }`;

    const data = await anilistQuery(gql, variables);
    const pageData = data.Page || {};
    const pageInfo = pageData.pageInfo || {};

    res.json(
      {
        page: pageInfo.currentPage || page,
        perPage: pageInfo.perPage || perPage,
        total: pageInfo.total || 0,
        hasNextPage: pageInfo.hasNextPage || false,
        results: pageData.media || [],
      },
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.suggestions = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ detail: "Query required" });

    const gql = `
        query ($search: String) {
            Page(page: 1, perPage: 8) {
                media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
                    id title { romaji english } coverImage { large } format status startDate { year } episodes
                }
            }
        }`;

    const data = await anilistQuery(gql, { search: query });
    const results = (data.Page?.media || []).map((item) => ({
      id: item.id,
      title: item.title?.english || item.title?.romaji,
      title_romaji: item.title?.romaji,
      poster: item.coverImage?.large,
      format: item.format,
      status: item.status,
      year: item.startDate?.year,
      episodes: item.episodes,
    }));

    res.json({ suggestions: results });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.filter = async (req, res) => {
  try {
    const {
      genre,
      tag,
      year,
      season,
      format,
      status,
      sort = "POPULARITY_DESC",
    } = req.query;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;

    const args = [
      "type: ANIME",
      "isAdult: false",
      `sort: [${SORT_MAP[sort] || "POPULARITY_DESC"}]`,
    ];
    const variables = { page, perPage };
    const varTypes = ["$page: Int", "$perPage: Int"];

    if (genre) {
      args.push("genre: $genre");
      variables.genre = genre;
      varTypes.push("$genre: String");
    }
    if (tag) {
      args.push("tag: $tag");
      variables.tag = tag;
      varTypes.push("$tag: String");
    }
    if (year) {
      args.push("seasonYear: $seasonYear");
      variables.seasonYear = parseInt(year);
      varTypes.push("$seasonYear: Int");
    }
    if (season) {
      args.push("season: $season");
      variables.season = season.toUpperCase();
      varTypes.push("$season: MediaSeason");
    }
    if (format) {
      args.push("format: $format");
      variables.format = format.toUpperCase();
      varTypes.push("$format: MediaFormat");
    }
    if (status) {
      args.push("status: $status");
      variables.status = status.toUpperCase();
      varTypes.push("$status: MediaStatus");
    }

    const gql = `
        query (${varTypes.join(", ")}) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total currentPage lastPage hasNextPage perPage }
                media(${args.join(", ")}) {
                    ${MEDIA_LIST_FIELDS}
                }
            }
        }`;

    const data = await anilistQuery(gql, variables);
    const pageData = data.Page || {};
    const pageInfo = pageData.pageInfo || {};

    res.json(
      {
        page: pageInfo.currentPage || page,
        perPage: pageInfo.perPage || perPage,
        total: pageInfo.total || 0,
        hasNextPage: pageInfo.hasNextPage || false,
        results: pageData.media || [],
      },
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.spotlight = async (req, res) => {
  try {
    const gql = `query { Page(page: 1, perPage: 10) { media(sort: [TRENDING_DESC, POPULARITY_DESC], type: ANIME, isAdult: false) { ${MEDIA_LIST_FIELDS} } } }`;
    const data = await anilistQuery(gql);
    res.json({ results: data.Page?.media || [] });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};
