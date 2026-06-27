const serverCache = require("../config/cache");

const ANILIST_URL = "https://graphql.anilist.co";

function translateId(encodedId) {
  try {
    let padded = encodedId;
    const pad = encodedId.length % 4;
    if (pad) padded += "=".repeat(4 - pad);
    const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(b64, "base64").toString("utf-8");
    if (decoded.includes(":")) return decoded;
    return encodedId;
  } catch (err) {
    return encodedId;
  }
}

function deepTranslate(obj) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => deepTranslate(item));
  } else if (obj !== null && typeof obj === "object") {
    for (const key in obj) {
      if (key === "id" && typeof obj[key] === "string") {
        obj[key] = translateId(obj[key]);
      } else {
        deepTranslate(obj[key]);
      }
    }
  }
}

async function anilistQuery(query, variables = null) {
  const body = { query };
  if (variables) body.variables = variables;

  const cacheKey = `anilist_${Buffer.from(JSON.stringify(body)).toString("base64")}`;
  const cachedData = serverCache.get(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] AniList Query: ${query.substring(0, 30).replace(/\n/g, "")}...`);
    return cachedData;
  }

  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("AniList query failed");
  }
  const resJson = await response.json();
  const data = resJson.data || {};
  
  serverCache.set(cacheKey, data, 3600); // 1 Hour TTL
  return data;
}

const MEDIA_LIST_FIELDS = `
    id
    title { romaji english native }
    coverImage { large extraLarge }
    bannerImage
    format
    season
    seasonYear
    episodes
    duration
    status
    averageScore
    meanScore
    popularity
    favourites
    genres
    source
    countryOfOrigin
    isAdult
    studios(isMain: true) { nodes { name isAnimationStudio } }
    nextAiringEpisode { episode airingAt timeUntilAiring }
    startDate { year month day }
    endDate { year month day }
`;

const MEDIA_FULL_FIELDS = `
    id
    idMal
    title { romaji english native }
    description(asHtml: false)
    coverImage { large extraLarge color }
    bannerImage
    format
    season
    seasonYear
    episodes
    duration
    status
    averageScore
    meanScore
    popularity
    favourites
    trending
    genres
    tags { name rank isMediaSpoiler }
    source
    countryOfOrigin
    isAdult
    hashtag
    synonyms
    siteUrl
    trailer { id site thumbnail }
    studios { nodes { id name isAnimationStudio siteUrl } }
    nextAiringEpisode { episode airingAt timeUntilAiring }
    startDate { year month day }
    endDate { year month day }
    characters(sort: [ROLE, RELEVANCE], perPage: 25) {
        edges {
            role
            node { id name { full native } image { large } }
            voiceActors(language: JAPANESE) { id name { full native } image { large } languageV2 }
        }
    }
    staff(sort: RELEVANCE, perPage: 25) {
        edges {
            role
            node { id name { full native } image { large } }
        }
    }
    relations {
        edges {
            relationType(version: 2)
            node {
                id
                title { romaji english native }
                coverImage { large }
                format
                type
                status
                episodes
                meanScore
            }
        }
    }
    recommendations(sort: RATING_DESC, perPage: 10) {
        nodes {
            rating
            mediaRecommendation {
                id
                title { romaji english native }
                coverImage { large }
                format
                episodes
                status
                meanScore
                averageScore
            }
        }
    }
    externalLinks { url site type }
    streamingEpisodes { title thumbnail url site }
    stats {
        scoreDistribution { score amount }
        statusDistribution { status amount }
    }
`;

module.exports = {
  translateId,
  deepTranslate,
  anilistQuery,
  MEDIA_LIST_FIELDS,
  MEDIA_FULL_FIELDS,
};
