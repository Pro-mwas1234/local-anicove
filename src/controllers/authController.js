const ANILIST_AUTH_URL = "https://anilist.co/api/v2/oauth/authorize";
const ANILIST_TOKEN_URL = "https://anilist.co/api/v2/oauth/token";
const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

const CLIENT_ID = process.env.ANILIST_CLIENT_ID || "";
const CLIENT_SECRET = process.env.ANILIST_CLIENT_SECRET || "";

/**
 * Get the redirect URI for the AniList OAuth callback.
 * Checks env var first, then falls back to auto-detecting from the request.
 */
function getRedirectUri(req) {
  if (process.env.ANILIST_REDIRECT_URI) {
    return process.env.ANILIST_REDIRECT_URI;
  }
  return `${req.protocol}://${req.get("host")}/api/auth/anilist/callback`;
}

/**
 * GET /auth/anilist
 * Redirect the user to AniList's OAuth authorization page.
 */
async function authorize(req, res) {
  if (!CLIENT_ID) {
    return res.status(500).json({ error: "AniList Client ID not configured" });
  }

  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  res.redirect(`${ANILIST_AUTH_URL}?${params.toString()}`);
}

/**
 * GET /auth/anilist/callback
 * Handle the OAuth callback from AniList, exchange the code for a token,
 * and store it in the session.
 */
async function callback(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    console.error("[Auth] AniList OAuth error:", oauthError);
    return res.redirect("/?auth_error=" + oauthError);
  }

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: "AniList credentials not configured" });
  }

  const redirectUri = getRedirectUri(req);

  try {
    const tokenRes = await fetch(ANILIST_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[Auth] Token exchange failed:", errText);
      return res.redirect("/?auth_error=token_exchange_failed");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect("/?auth_error=no_token");
    }

    // Fetch user info from AniList
    const userQuery = `
      query {
        Viewer {
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
            }
          }
          unreadNotificationCount
          options {
            profileColor
          }
        }
      }
    `;

    const userRes = await fetch(ANILIST_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: userQuery }),
    });

    if (!userRes.ok) {
      const errBody = await userRes.text().catch(() => "(no body)");
      console.error(`[Auth] Failed to fetch user info: HTTP ${userRes.status} - ${errBody}`);
      return res.redirect("/?auth_error=user_fetch_failed");
    }

    const userData = await userRes.json();
    const viewer = userData.data?.Viewer;

    if (!viewer) {
      const errMsg = JSON.stringify(userData.errors || "No user data returned");
      console.error("[Auth] No viewer in response:", errMsg);
      return res.redirect("/?auth_error=no_user");
    }

    // Store in session (cookie-session auto-saves on response)
    // Truncate about field to stay well under the ~4KB cookie limit
    req.session.anilistToken = accessToken;
    req.session.anilistUser = {
      id: viewer.id,
      name: viewer.name,
      avatar: viewer.avatar,
      bannerImage: viewer.bannerImage,
      about: viewer.about ? viewer.about.substring(0, 500) : null,
      stats: viewer.statistics,
      unreadNotificationCount: viewer.unreadNotificationCount,
      profileColor: viewer.options?.profileColor || null,
    };

    res.redirect("/?auth_success=1");
  } catch (err) {
    console.error("[Auth] Callback error:", err);
    res.redirect("/?auth_error=server_error");
  }
}

/**
 * GET /auth/me
 * Return the currently authenticated user info, or null if not logged in.
 */
function me(req, res) {
  if (!req.session?.anilistUser) {
    return res.json({ user: null });
  }
  res.json({ user: req.session.anilistUser });
}

/**
 * POST /auth/logout
 * Destroy the session and log the user out.
 */
function logout(req, res) {
  // Clear session — cookie-session will set a delete cookie on response
  req.session = null;
  res.json({ success: true });
}

module.exports = {
  authorize,
  callback,
  me,
  logout,
};
