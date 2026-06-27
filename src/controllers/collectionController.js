const { anilistQuery, MEDIA_LIST_FIELDS } = require("../utils/anilist");

async function fetchCollection(sortType, statusStr, page, perPage) {
  const statusFilter = statusStr ? `, status: ${statusStr}` : "";
  const gql = `
    query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage perPage }
            media(type: ANIME, isAdult: false, sort: [${sortType}]${statusFilter}) {
                ${MEDIA_LIST_FIELDS}
            }
        }
    }`;
  const data = await anilistQuery(gql, { page, perPage });
  const pageData = data.Page || {};
  const pageInfo = pageData.pageInfo || {};
  return {
    page: pageInfo.currentPage || page,
    perPage: pageInfo.perPage || perPage,
    total: pageInfo.total || 0,
    hasNextPage: pageInfo.hasNextPage || false,
    results: pageData.media || [],
  };
}

exports.trending = async (req, res) => {
  try {
    res.json(
      await fetchCollection(
        "TRENDING_DESC",
        null,
        parseInt(req.query.page) || 1,
        parseInt(req.query.per_page) || 20,
      ),
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.popular = async (req, res) => {
  try {
    res.json(
      await fetchCollection(
        "POPULARITY_DESC",
        null,
        parseInt(req.query.page) || 1,
        parseInt(req.query.per_page) || 20,
      ),
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.upcoming = async (req, res) => {
  try {
    res.json(
      await fetchCollection(
        "POPULARITY_DESC",
        "NOT_YET_RELEASED",
        parseInt(req.query.page) || 1,
        parseInt(req.query.per_page) || 20,
      ),
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.recent = async (req, res) => {
  try {
    res.json(
      await fetchCollection(
        "START_DATE_DESC",
        "RELEASING",
        parseInt(req.query.page) || 1,
        parseInt(req.query.per_page) || 20,
      ),
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.schedule = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const gql = `
        query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total currentPage lastPage hasNextPage perPage }
                airingSchedules(notYetAired: true, sort: TIME) {
                    episode airingAt timeUntilAiring
                    media { ${MEDIA_LIST_FIELDS} }
                }
            }
        }`;
    const data = await anilistQuery(gql, { page, perPage });
    const pageData = data.Page || {};
    const results = (pageData.airingSchedules || [])
      .filter((item) => {
        const m = item.media || {};
        const genres = m.genres || [];
        return !m.isAdult && !genres.includes("Hentai") && !genres.includes("Ecchi");
      })
      .map((item) => {
        const entry = item.media || {};
        entry.next_episode = item.episode;
        entry.airingAt = item.airingAt;
        entry.timeUntilAiring = item.timeUntilAiring;
        entry.nextAiringEpisode = {
          episode: item.episode,
          airingAt: item.airingAt,
          timeUntilAiring: item.timeUntilAiring,
        };
        return entry;
      });
    res.json(
      {
        page: pageData.pageInfo?.currentPage || page,
        perPage: pageData.pageInfo?.perPage || perPage,
        total: pageData.pageInfo?.total || 0,
        hasNextPage: pageData.pageInfo?.hasNextPage || false,
        results: results,
      },
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

exports.scheduleWeek = async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const daySeconds = 86400;
    const todayStart = now - (now % daySeconds);
    const weekStart = todayStart - (3 * daySeconds);
    const weekEnd = todayStart + (4 * daySeconds);

    let allResults = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 5) {
      const gql = `
        query ($page: Int, $perPage: Int, $start: Int, $end: Int) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { hasNextPage }
                airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
                    episode airingAt timeUntilAiring
                    media { ${MEDIA_LIST_FIELDS} }
                }
            }
        }`;
      const data = await anilistQuery(gql, {
        page,
        perPage: 50,
        start: weekStart,
        end: weekEnd,
      });
      const pageData = data.Page || {};
      const schedules = pageData.airingSchedules || [];

      schedules.forEach((item) => {
        const entry = item.media || {};
        const genres = entry.genres || [];
        if (entry.isAdult || genres.includes("Hentai") || genres.includes("Ecchi")) return;
        entry.next_episode = item.episode;
        entry.airingAt = item.airingAt;
        entry.timeUntilAiring = item.timeUntilAiring;
        entry.nextAiringEpisode = {
          episode: item.episode,
          airingAt: item.airingAt,
          timeUntilAiring: item.timeUntilAiring,
        };
        allResults.push(entry);
      });

      hasMore = pageData.pageInfo?.hasNextPage || false;
      page++;
    }

    res.json({ results: allResults });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};
