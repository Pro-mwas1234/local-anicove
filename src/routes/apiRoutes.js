const express = require("express");
const router = express.Router();

const discoveryController = require("../controllers/discoveryController");
const collectionController = require("../controllers/collectionController");
const animeController = require("../controllers/animeController");
const streamController = require("../controllers/streamController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// Health Check (fast, no external calls — for Render)
router.get("/health", (req, res) => res.json({ status: "ok", time: Date.now() }));

// Discovery & Search Routes
router.get("/cache-stats", discoveryController.getCacheStats);
router.get("/search", discoveryController.search);
router.get("/suggestions", discoveryController.suggestions);
router.get("/filter", discoveryController.filter);
router.get("/spotlight", discoveryController.spotlight);

// Collection Routes
router.get("/trending", collectionController.trending);
router.get("/popular", collectionController.popular);
router.get("/upcoming", collectionController.upcoming);
router.get("/recent", collectionController.recent);
router.get("/schedule", collectionController.schedule);
router.get("/schedule/week", collectionController.scheduleWeek);

// Anime Details Routes
router.get("/info/:anilist_id", animeController.info);
router.get("/anime/:anilist_id/characters", animeController.characters);
router.get("/anime/:anilist_id/relations", animeController.relations);
router.get("/anime/:anilist_id/recommendations", animeController.recommendations);

// Streaming Routes
router.get("/episodes/:anilist_id", streamController.episodes);
router.get("/skips/:mal_id/:episode", streamController.skips);
router.get("/sources", streamController.sources);
router.get("/watch/:provider/:anilist_id/:category/:slug", streamController.watch);
router.get("/stream/authorize", streamController.authorize);
router.post("/stream/authorize", streamController.authorize);

// Auth Routes
router.get("/auth/anilist", authController.authorize);
router.get("/auth/anilist/callback", authController.callback);
router.get("/auth/me", authController.me);
router.post("/auth/logout", authController.logout);

// User / AniList List Routes (require authentication)
router.get("/user/animelist", userController.requireAuth, userController.getAnimeList);
router.post("/user/animelist", userController.requireAuth, userController.saveAnimeListEntry);
router.delete("/user/animelist/:mediaId", userController.requireAuth, userController.deleteAnimeListEntry);
router.post("/user/animelist/progress", userController.requireAuth, userController.updateProgress);
router.get("/user/stats", userController.requireAuth, userController.getUserStats);
router.get("/user/notifications", userController.requireAuth, userController.getNotifications);

module.exports = router;
