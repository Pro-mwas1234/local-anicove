/**
 * Get the best available title for an anime object.
 */
export function getTitle(anime) {
  if (!anime?.title) return "Unknown";
  if (typeof anime.title === "string") return anime.title;
  return anime.title.english || anime.title.romaji || anime.title.native || "Unknown";
}

/**
 * Truncate text to a given length with ellipsis.
 */
export function truncateText(text, maxLength = 200) {
  if (!text) return "";
  // Strip HTML tags from descriptions
  const cleaned = text.replace(/<[^>]*>/g, "");
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
}

/**
 * Format a score percentage (e.g. 85 -> "8.5").
 */
export function formatScore(score) {
  if (!score) return "N/A";
  return (score / 10).toFixed(1);
}

/**
 * Format episode count for display.
 */
export function formatEpisodes(count) {
  if (!count) return "?";
  return `${count} EP`;
}

/**
 * Get the cover image URL, with fallback.
 */
export function getCoverImage(anime) {
  if (!anime) return "/placeholder.svg";
  if (anime.poster) return anime.poster;
  return anime.coverImage?.large || anime.coverImage?.medium || "/placeholder.svg";
}

/**
 * Get the banner image URL.
 */
export function getBannerImage(anime) {
  return anime?.bannerImage || anime?.coverImage?.extraLarge || anime?.coverImage?.large || "";
}

/**
 * Format a date object { year, month, day } to readable string.
 */
export function formatDate(dateObj) {
  if (!dateObj || !dateObj.year) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = [];
  if (dateObj.month) parts.push(months[dateObj.month - 1]);
  if (dateObj.day) parts.push(dateObj.day);
  parts.push(dateObj.year);
  return parts.join(" ");
}

/**
 * Format seconds to MM:SS or HH:MM:SS.
 */
export function formatTime(seconds) {
  if (!seconds || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Get the day name for a schedule.
 */
export function getDayName(dayIndex) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayIndex] || "";
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format status for display (e.g. NOT_YET_RELEASED -> "Not Yet Released").
 */
export function formatStatus(status) {
  if (!status) return "";
  return status.split("_").map(capitalize).join(" ");
}
