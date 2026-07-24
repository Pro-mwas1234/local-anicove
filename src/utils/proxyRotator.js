// Free proxy list sources (multiple for redundancy)
const PROXY_SOURCES = [
  // ProxyScrape v4
  "https://api.proxyscrape.com/v4/free-proxy-list/get?request=displayproxies&protocol=http",
  "https://api.proxyscrape.com/v4/free-proxy-list/get?request=displayproxies&protocol=socks5",
  // TheSpeedX proxy lists
  "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
  "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt",
  // ShiftyTR proxy list
  "https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt",
  // monosans proxy lists
  "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
  "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt",
];

// Validation target — lightweight and reliable
const VALIDATION_URL = "https://www.google.com";
const VALIDATION_TIMEOUT = 4000;
const MAX_POOL_SIZE = 15;
const MAX_CANDIDATES = 100;
const REFRESH_INTERVAL = 4 * 60 * 1000; // Every 4 minutes

let proxyPool = [];
let currentIndex = 0;
let lastRefreshTime = 0;
let refreshInProgress = false;

/** Shared helper — fires a pool refresh if one isn't already running */
function _startRefresh() {
  if (refreshInProgress) return;
  refreshInProgress = true;
  refreshPool()
    .catch((err) => console.error("[PROXY-POOL] Refresh error:", err.message))
    .finally(() => { refreshInProgress = false; });
}

/**
 * Returns a working proxy URL by rotating through a validated pool.
 * Falls back to null if no proxy is available.
 */
async function getWorkingProxy() {
  const now = Date.now();

  // Refresh if pool is empty or stale (fire-and-forget — never block)
  if (proxyPool.length === 0 || now - lastRefreshTime > REFRESH_INTERVAL) {
    _startRefresh();
  }

  if (proxyPool.length > 0) {
    const proxy = proxyPool[currentIndex % proxyPool.length];
    currentIndex++;
    return proxy;
  }

  return null;
}

/**
 * Returns a prebuilt proxy agent for the given target URL.
 * Handles HTTP, HTTPS, and SOCKS protocols.
 * Uses dynamic import() for Vercel serverless ESM compatibility.
 */
async function getProxyAgent(proxyUrl, targetUrl) {
  if (!proxyUrl) return null;

  try {
    if (proxyUrl.startsWith("socks5") || proxyUrl.startsWith("socks4") || proxyUrl.startsWith("socks://")) {
      const { SocksProxyAgent } = await import("socks-proxy-agent");
      return new SocksProxyAgent(proxyUrl);
    }
    if (targetUrl && targetUrl.startsWith("https")) {
      const { HttpsProxyAgent } = await import("https-proxy-agent");
      return new HttpsProxyAgent(proxyUrl);
    }
    const { HttpProxyAgent } = await import("http-proxy-agent");
    return new HttpProxyAgent(proxyUrl);
  } catch (e) {
    console.warn("[PROXY-POOL] Failed to create agent:", e.message);
    return null;
  }
}

async function refreshPool() {
  try {
    const candidates = await fetchProxyLists();
    if (candidates.length === 0) {
      console.warn("[PROXY-POOL] No proxies found from any source");
      return;
    }

    console.log(`[PROXY-POOL] Fetching ${candidates.length} candidates, validating...`);
    const validated = await validateProxies(candidates);

    if (validated.length > 0) {
      proxyPool = validated;
      currentIndex = 0;
      console.log(`[PROXY-POOL] Pool refreshed: ${validated.length} working proxies`);
    } else {
      console.warn("[PROXY-POOL] All candidates failed validation, keeping old pool");
    }

    lastRefreshTime = Date.now();
  } catch (err) {
    console.error("[PROXY-POOL] Refresh failed:", err.message);
  }
}

async function fetchProxyLists() {
  const seen = new Set();

  const fetchPromises = PROXY_SOURCES.map((url) =>
    fetchProxySource(url).catch(() => [])
  );

  const results = await Promise.allSettled(fetchPromises);

  for (const result of results) {
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      for (const proxy of result.value) {
        seen.add(proxy);
      }
    }
  }

  return Array.from(seen);
}

async function fetchProxySource(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[PROXY-POOL] Source returned ${res.status}: ${url.slice(0, 60)}`);
      return [];
    }

    const text = await res.text();
    const proxies = [];

    text.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      if (trimmed.includes("://")) {
        const proto = trimmed.split("://")[0].toLowerCase();
        if (["http", "https", "socks5", "socks4", "socks"].includes(proto)) {
          proxies.push(trimmed);
        }
        return;
      }

      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(trimmed)) {
        proxies.push(`http://${trimmed}`);
        return;
      }

      if (trimmed.includes(":") && !trimmed.includes(" ")) {
        proxies.push(`http://${trimmed}`);
      }
    });

    return proxies;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.warn(`[PROXY-POOL] Source timed out: ${url.slice(0, 60)}`);
    }
    return [];
  }
}

async function validateProxies(proxies) {
  const validated = [];
  const batchSize = 10;

  const shuffled = proxies.sort(() => Math.random() - 0.5).slice(0, MAX_CANDIDATES);

  for (let i = 0; i < shuffled.length && validated.length < MAX_POOL_SIZE; i += batchSize) {
    const batch = shuffled.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((proxy) => testProxy(proxy))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        validated.push(result.value);
        if (validated.length >= MAX_POOL_SIZE) break;
      }
    }
  }

  return validated;
}

async function testProxy(proxyUrl) {
  try {
    const agent = await getProxyAgent(proxyUrl, VALIDATION_URL);
    if (!agent) return null;

    const isHttpsTarget = VALIDATION_URL.startsWith("https");
    const mod = isHttpsTarget ? require("https") : require("http");
    const parsedUrl = new URL(VALIDATION_URL);

    const result = await new Promise((resolve) => {
      const req = mod.request(
        VALIDATION_URL,
        {
          agent,
          method: "HEAD",
          timeout: VALIDATION_TIMEOUT - 500,
          headers: { Host: parsedUrl.hostname },
        },
        (res) => {
          resolve({ ok: true, status: res.statusCode });
          res.resume();
        }
      );
      req.on("error", () => resolve({ ok: false }));
      req.on("timeout", () => { req.destroy(); resolve({ ok: false }); });
      req.end();
    });

    if (result.ok) return proxyUrl;
  } catch {
    // Proxy failed validation
  }
  return null;
}

function getPoolStats() {
  return {
    size: proxyPool.length,
    currentIndex,
    lastRefresh: lastRefreshTime ? new Date(lastRefreshTime).toISOString() : "never",
    refreshInProgress,
  };
}

// Fire warm-up refresh immediately on module load so proxies are ready
// by the time the first request arrives (Vercel cold starts)
_startRefresh();

module.exports = {
  getWorkingProxy,
  getProxyAgent,
  getPoolStats,
};
