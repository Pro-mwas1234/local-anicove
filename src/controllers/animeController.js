const { anilistQuery, MEDIA_FULL_FIELDS } = require("../utils/anilist");

exports.info = async (req, res) => {
  try {
    const gql = `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FULL_FIELDS} } }`;
    const data = await anilistQuery(gql, {
      id: parseInt(req.params.anilist_id),
    });
    if (!data.Media) return res.status(404).json({ detail: "Anime not found" });
    res.json(data.Media);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.characters = async (req, res) => {
  try {
    const gql = `
        query ($id: Int, $page: Int, $perPage: Int) {
            Media(id: $id, type: ANIME) {
                id title { romaji english }
                characters(sort: [ROLE, RELEVANCE], page: $page, perPage: $perPage) {
                    pageInfo { total currentPage lastPage hasNextPage perPage }
                    edges {
                        role node { id name { full native userPreferred } image { large medium } description gender dateOfBirth { year month day } age favourites siteUrl }
                        voiceActors(language: JAPANESE) { id name { full native } image { large } languageV2 }
                    }
                }
            }
        }`;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 25;
    const data = await anilistQuery(gql, {
      id: parseInt(req.params.anilist_id),
      page,
      perPage,
    });
    if (!data.Media) return res.status(404).json({ detail: "Anime not found" });

    const chars = data.Media.characters || {};
    res.json(
      {
        page: chars.pageInfo?.currentPage || page,
        perPage: chars.pageInfo?.perPage || perPage,
        total: chars.pageInfo?.total || 0,
        hasNextPage: chars.pageInfo?.hasNextPage || false,
        characters: chars.edges || [],
      },
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.relations = async (req, res) => {
  try {
    const gql = `
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id title { romaji english }
                relations { edges { relationType(version: 2) node { id title { romaji english native } coverImage { large } bannerImage format type status episodes chapters meanScore averageScore popularity startDate { year month day } } } }
            }
        }`;
    const data = await anilistQuery(gql, {
      id: parseInt(req.params.anilist_id),
    });
    if (!data.Media) return res.status(404).json({ detail: "Anime not found" });
    res.json(
      {
        id: data.Media.id,
        title: data.Media.title,
        relations: data.Media.relations?.edges || [],
      },
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.recommendations = async (req, res) => {
  try {
    const gql = `
        query ($id: Int, $page: Int, $perPage: Int) {
            Media(id: $id, type: ANIME) {
                id title { romaji english }
                recommendations(sort: RATING_DESC, page: $page, perPage: $perPage) {
                    pageInfo { total currentPage lastPage hasNextPage perPage }
                    nodes { rating mediaRecommendation { id title { romaji english native } coverImage { large extraLarge } bannerImage format episodes status meanScore averageScore popularity genres startDate { year } } }
                }
            }
        }`;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const data = await anilistQuery(gql, {
      id: parseInt(req.params.anilist_id),
      page,
      perPage,
    });
    if (!data.Media) return res.status(404).json({ detail: "Anime not found" });

    const recs = data.Media.recommendations || {};
    res.json(
      {
        page: recs.pageInfo?.currentPage || page,
        perPage: recs.pageInfo?.perPage || perPage,
        total: recs.pageInfo?.total || 0,
        hasNextPage: recs.pageInfo?.hasNextPage || false,
        recommendations: recs.nodes || [],
      },
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};
