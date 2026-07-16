const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

/**
 * Helper: Make an authenticated AniList GraphQL request using the session token.
 */
async function anilistAuthQuery(req, query, variables = {}) {
  const token = req.session?.anilistToken;
  if (!token) {
    throw new Error("Not authenticated with AniList");
  }

  const res = await fetch(ANILIST_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AniList API error: ${errText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }
  return json.data;
}

/**
 * Helper: Require authentication middleware.
 */
function requireAuth(req, res, next) {
  if (!req.session?.anilistToken) {
    return res.status(401).json({ error: "Not authenticated with AniList" });
  }
  next();
}

/**
 * GET /user/animelist
 * Fetch the authenticated user's anime list.
 * Accepts optional query params: status (CURRENT, COMPLETED, PLANNING, etc.), page, perPage
 */
async function getAnimeList(req, res) {
  try {
    const { status } = req.query;
    const userId = req.session.anilistUser.id;

    const statusFilter = status ? `status: ${status}` : "";

    const query = `
      query ($userId: Int) {
        MediaListCollection(userId: $userId, type: ANIME, ${statusFilter}) {
          lists {
            name
            isCustomList
            isSplitCompletedList
            status
            entries {
              id
              score
              progress
              progressVolumes
              repeat
              priority
              private
              notes
              startedAt { year month day }
              completedAt { year month day }
              updatedAt
              createdAt
              media {
                id
                idMal
                title { romaji english native userPreferred }
                coverImage { large extraLarge color }
                bannerImage
                format
                season
                seasonYear
                status
                episodes
                duration
                averageScore
                meanScore
                popularity
                genres
                studios(isMain: true) { nodes { name } }
                nextAiringEpisode { episode airingAt timeUntilAiring }
                startDate { year month day }
                endDate { year month day }
              }
            }
          }
        }
      }
    `;

    const data = await anilistAuthQuery(req, query, {
      userId,
    });

    res.json(data.MediaListCollection || { lists: [] });
  } catch (err) {
    console.error("[User] Failed to fetch anime list:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /user/animelist
 * Save or update an anime list entry on AniList.
 * Body: { mediaId, status, score, progress, note, ... }
 */
async function saveAnimeListEntry(req, res) {
  try {
    const {
      mediaId,
      status,
      score,
      progress,
      progressVolumes,
      repeat,
      private: isPrivate,
      notes,
      startedAt,
      completedAt,
    } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }

    const mutation = `
      mutation ($mediaId: Int, $status: MediaListStatus, $score: Float, $progress: Int, $progressVolumes: Int, $repeat: Int, $private: Boolean, $notes: String, $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput) {
        SaveMediaListEntry(mediaId: $mediaId, status: $status, score: $score, progress: $progress, progressVolumes: $progressVolumes, repeat: $repeat, private: $private, notes: $notes, startedAt: $startedAt, completedAt: $completedAt) {
          id
          mediaId
          status
          score
          progress
          progressVolumes
          repeat
          private
          notes
          startedAt { year month day }
          completedAt { year month day }
          updatedAt
          createdAt
        }
      }
    `;

    const variables = {};
    if (mediaId) variables.mediaId = parseInt(mediaId);
    if (status) variables.status = status;
    if (score !== undefined && score !== null) variables.score = parseFloat(score);
    if (progress !== undefined && progress !== null) variables.progress = parseInt(progress);
    if (progressVolumes !== undefined) variables.progressVolumes = parseInt(progressVolumes);
    if (repeat !== undefined) variables.repeat = parseInt(repeat);
    if (isPrivate !== undefined) variables.private = isPrivate;
    if (notes !== undefined) variables.notes = notes;
    if (startedAt) variables.startedAt = startedAt;
    if (completedAt) variables.completedAt = completedAt;

    const data = await anilistAuthQuery(req, mutation, variables);
    res.json({ entry: data.SaveMediaListEntry });
  } catch (err) {
    console.error("[User] Failed to save anime list entry:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /user/animelist/:mediaId
 * Delete an anime list entry from AniList.
 */
async function deleteAnimeListEntry(req, res) {
  try {
    const { mediaId } = req.params;

    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }

    const mutation = `
      mutation ($mediaId: Int) {
        DeleteMediaListEntry(id: $mediaId) {
          deleted
        }
      }
    `;

    const data = await anilistAuthQuery(req, mutation, {
      mediaId: parseInt(mediaId),
    });

    res.json({ deleted: data.DeleteMediaListEntry?.deleted || false });
  } catch (err) {
    console.error("[User] Failed to delete anime list entry:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /user/animelist/progress
 * Update just the episode progress for an anime.
 * Body: { mediaId, progress, increment }
 */
async function updateProgress(req, res) {
  try {
    const { mediaId, progress, increment } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }

    let finalProgress = progress;

    // If increment mode, get current list entry first
    if (increment) {
      const query = `
        query ($userId: Int, $mediaId: Int) {
          MediaList(userId: $userId, mediaId: $mediaId) {
            id
            progress
            status
            media { episodes }
          }
        }
      `;
      const userId = req.session.anilistUser.id;
      const data = await anilistAuthQuery(req, query, { userId: parseInt(userId), mediaId: parseInt(mediaId) });
      const currentEntry = data.MediaList;

      finalProgress = (currentEntry?.progress || 0) + 1;

      // Auto-mark as COMPLETED if we've watched all episodes
      const totalEpisodes = currentEntry?.media?.episodes;
      if (totalEpisodes && finalProgress >= totalEpisodes) {
        const updateMutation = `
          mutation ($mediaId: Int, $progress: Int, $status: MediaListStatus) {
            SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status) {
              id
              mediaId
              progress
              status
              updatedAt
            }
          }
        `;
        const updateData = await anilistAuthQuery(req, updateMutation, {
          mediaId: parseInt(mediaId),
          progress: finalProgress,
          status: "COMPLETED",
        });
        return res.json({ entry: updateData.SaveMediaListEntry });
      }
    }

    const mutation = `
      mutation ($mediaId: Int, $progress: Int) {
        SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
          id
          mediaId
          progress
          status
          updatedAt
        }
      }
    `;

    const data = await anilistAuthQuery(req, mutation, {
      mediaId: parseInt(mediaId),
      progress: finalProgress !== undefined ? finalProgress : parseInt(progress),
    });

    res.json({ entry: data.SaveMediaListEntry });
  } catch (err) {
    console.error("[User] Failed to update progress:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /user/stats
 * Get the authenticated user's AniList statistics.
 */
async function getUserStats(req, res) {
  try {
    const userId = req.session.anilistUser.id;

    const query = `
      query ($userId: Int) {
        User(id: $userId) {
          id
          name
          avatar { large medium }
          bannerImage
          about
          statistics {
            anime {
              count
              episodesWatched
              minutesWatched
              meanScore
              standardDeviation
              scores { score count }
              lengths { length count minutesWatched meanScore }
              releaseYears { releaseYear count }
              startYears { startYear count }
              genres { genre count meanScore timeWatched }
              tags { tag { name } count meanScore timeWatched }
              countries { country count meanScore timeWatched }
              voiceActors { voiceActor { id name { full } image { large } } count meanScore timeWatched }
              staff { staff { id name { full } image { large } } count meanScore timeWatched }
              studios { studio { id name } count meanScore timeWatched }
            }
          }
          favourites { anime { nodes { id title { romaji english } coverImage { large } } } }
        }
      }
    `;

    const data = await anilistAuthQuery(req, query, { userId: parseInt(userId) });
    res.json({ user: data.User });
  } catch (err) {
    console.error("[User] Failed to fetch user stats:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  requireAuth,
  getAnimeList,
  saveAnimeListEntry,
  deleteAnimeListEntry,
  updateProgress,
  getUserStats,
};
