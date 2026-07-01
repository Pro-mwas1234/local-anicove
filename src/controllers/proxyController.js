const { Readable } = require("stream");
const { pipeline } = require("stream/promises");
const serverCache = require("../config/cache");

// Modern browser fingerprint headers (matching Miruro's Chromium 136 from screenshot)
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": '"Microsoft Edge";v="136", "Chromium";v="136", "Not.A/Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
};

// Known-good origin/referer pairs per CDN domain pattern
const ORIGIN_WHITELIST = [
  { patterns: ["ultracloud", "megacloud", "rapidcloud", "dokicloud"], origin: "https://www.miruro.tv", referer: "https://www.miruro.tv/" },
  { patterns: ["ultracloud", "megacloud", "rapidcloud", "dokicloud"], origin: "https://hianime.to", referer: "https://hianime.to/" },
  { patterns: ["owocdn", "uwucdn", "bigdreamsmalldih", "kwik.", "pahe."], origin: "https://kwik.cx", referer: "https://kwik.cx/" },
  { patterns: ["allmanga", "fallanime", "wixmp", "203.188."], origin: "https://allanimeuns.bio", referer: "https://allanimeuns.bio/" },
  { patterns: ["allmanga", "fallanime", "wixmp", "203.188."], origin: "https://allmanga.to", referer: "https://allmanga.to/" },
  { patterns: ["nekostream", "ipstatp"], origin: "https://vidtube.site", referer: "https://vidtube.site/" },
];

// Default strict CDN hostnames (self-learning list augmented at runtime)
const DEFAULT_STRICT_CDNS = ["nekostream", "owocdn", "vidtube", "wixmp", "mt.", "203.188."];

function resolveRefererForUrl(targetUrl, customReferer) {
  if (customReferer && customReferer.startsWith('http')) {
    return customReferer;
  }
  if (targetUrl.includes('owocdn.top') || targetUrl.includes('uwucdn.top') || targetUrl.includes('bigdreamsmalldih.site') || targetUrl.includes('kwik.') || targetUrl.includes('pahe.')) {
    return 'https://kwik.cx/';
  }
  if (targetUrl.includes('nekostream.site') || targetUrl.includes('ipstatp.com')) {
    return 'https://vidtube.site/';
  }
  if (targetUrl.includes('wixmp.com') || targetUrl.includes('203.188.') || targetUrl.includes('allmanga') || targetUrl.includes('fallanime')) {
    return 'https://allanimeuns.bio/';
  }
  return customReferer || null;
}

function getOriginFromReferer(refererHeader, targetUrl) {
  try {
    return new URL(refererHeader).origin;
  } catch (e) {
    return new URL(targetUrl).origin;
  }
}

function buildHeaders(targetUrl, refererHeader, originHeader, cachedCookie, rangeHeader) {
  const headers = {
    ...BROWSER_HEADERS,
    "Referer": refererHeader,
    "Origin": originHeader,
  };
  if (cachedCookie) headers["Cookie"] = cachedCookie;
  if (rangeHeader) headers["Range"] = rangeHeader;
  return headers;
}

function isStrictCdnHost(hostname) {
  // Check dynamic cache first (learned from 403 reports)
  if (serverCache.get("strict_cdn_" + hostname)) return true;
  // Check default list
  return DEFAULT_STRICT_CDNS.some(pattern => hostname.includes(pattern));
}

function findAlternateOrigin(targetUrl, currentReferer) {
  for (const entry of ORIGIN_WHITELIST) {
    if (entry.patterns.some(p => targetUrl.includes(p)) && entry.referer !== currentReferer) {
      // Check if we've cached this origin as working for this CDN
      return { origin: entry.origin, referer: entry.referer };
    }
  }
  // Fallback: try miruro.tv as a generic whitelisted origin
  if (currentReferer !== "https://www.miruro.tv/") {
    return { origin: "https://www.miruro.tv", referer: "https://www.miruro.tv/" };
  }
  return null;
}

async function fetchWithRetry(targetUrl, headers, signal, currentReferer) {
  let response = await fetch(targetUrl, { headers, signal });

  // If 403, try rotating to an alternate known-good origin
  if (response.status === 403) {
    const alt = findAlternateOrigin(targetUrl, currentReferer);
    if (alt) {
      let targetHost = "";
      try { targetHost = new URL(targetUrl).hostname; } catch (e) {}

      console.log(`[PROXY] 403 from ${targetHost}, retrying with origin ${alt.origin}`);
      const retryHeaders = { ...headers, "Referer": alt.referer, "Origin": alt.origin };
      response = await fetch(targetUrl, { headers: retryHeaders, signal });

      // Cache successful origin for this CDN hostname
      if (response.ok || response.status === 206) {
        if (targetHost) {
          serverCache.set("good_origin_" + targetHost, alt.referer, 86400); // 24h
        }
      }
    }
  }

  return response;
}

exports.proxy = async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No url provided");

    let customReferer = req.query.referer;
    customReferer = resolveRefererForUrl(targetUrl, customReferer);

    let targetHost = "";
    try { targetHost = new URL(targetUrl).hostname; } catch (e) {}

    // Check if we have a cached good origin for this CDN
    const cachedGoodOrigin = targetHost ? serverCache.get("good_origin_" + targetHost) : null;
    if (cachedGoodOrigin && !customReferer) {
      customReferer = cachedGoodOrigin;
    }

    const refererHeader = customReferer ? customReferer : new URL(targetUrl).origin + "/";
    const originHeader = getOriginFromReferer(refererHeader, targetUrl);

    const cachedCookie = req.query.cookie || (targetHost ? serverCache.get("cookie_" + targetHost) : null);
    const headers = buildHeaders(targetUrl, refererHeader, originHeader, cachedCookie, req.headers.range);

    const controller = new AbortController();
    req.on("close", () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    const response = await fetchWithRetry(targetUrl, headers, controller.signal, refererHeader);
    if (!response.ok && response.status !== 206) {
      // If 403, mark this CDN as strict so future manifests proxy its segments
      if (response.status === 403 && targetHost) {
        serverCache.set("strict_cdn_" + targetHost, true, 86400); // 24h
      }
      res.status(response.status);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const errText = await response.text().catch(() => "Proxy error");
      return res.send(errText);
    }

    const reader = response.body.getReader();
    const { done, value: firstChunk } = await reader.read();

    if (done || !firstChunk) {
      res.status(response.status).end();
      return;
    }

    const isKey = targetUrl.includes('.key');
    const isM3u8 =
      targetUrl.includes('.m3u8') ||
      (!isKey && firstChunk.length >= 7 && Buffer.from(firstChunk.slice(0, 7)).toString('utf-8') === '#EXTM3U') ||
      response.headers.get("content-type")?.toLowerCase().includes("mpegurl") ||
      response.headers.get("content-type")?.toLowerCase().includes("m3u8");

    if (isM3u8) {
      const chunks = [firstChunk];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      let text = Buffer.concat(chunks).toString("utf-8");
      const baseUrl = new URL(targetUrl);
      const lines = text.split('\n');
      const proxyBase = `/proxy?url=`; 

      // Smart Adaptive Routing with self-learning strict CDN detection:
      // - Default strict list covers known strict CDNs
      // - Dynamic list grows when 403s are reported via /proxy/report-blocked or encountered during fetching
      // - proxyChunks=true forces full proxying (used by frontend fallback)
      const forceProxy = req.query.proxyChunks === 'true' || req.query.proxyChunks === '1';
      const isHybridManifest = !forceProxy && !isStrictCdnHost(targetHost);

      const cookieParam = cachedCookie ? "&cookie=" + encodeURIComponent(cachedCookie) : "";

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line && !line.startsWith('#')) {
          let absoluteUrl = line.startsWith('http') ? line : new URL(line, baseUrl).href;
          if (isHybridManifest && !absoluteUrl.toLowerCase().includes('.m3u8')) {
            // Check if the segment's CDN host is strict (self-learning)
            let segHost = "";
            try { segHost = new URL(absoluteUrl).hostname; } catch (e) {}
            if (segHost && isStrictCdnHost(segHost)) {
              lines[i] = proxyBase + encodeURIComponent(absoluteUrl) + "&referer=" + encodeURIComponent(refererHeader) + cookieParam;
            } else {
              lines[i] = absoluteUrl;
            }
          } else {
            lines[i] = proxyBase + encodeURIComponent(absoluteUrl) + "&referer=" + encodeURIComponent(refererHeader) + cookieParam;
          }
        } else if (line.includes('URI="')) {
          const match = line.match(/URI="([^"]+)"/);
          if (match) {
            let uri = match[1];
            if (!uri.startsWith('data:')) {
              let absoluteUri = uri.startsWith('http') ? uri : new URL(uri, baseUrl).href;
              if (isHybridManifest && !absoluteUri.toLowerCase().includes('.m3u8') && !absoluteUri.toLowerCase().includes('.key')) {
                let uriHost = "";
                try { uriHost = new URL(absoluteUri).hostname; } catch (e) {}
                if (uriHost && isStrictCdnHost(uriHost)) {
                  let wrappedUri = proxyBase + encodeURIComponent(absoluteUri) + "&referer=" + encodeURIComponent(refererHeader) + cookieParam;
                  lines[i] = line.replace(`URI="${match[1]}"`, `URI="${wrappedUri}"`);
                } else {
                  lines[i] = line.replace(`URI="${match[1]}"`, `URI="${absoluteUri}"`);
                }
              } else {
                let wrappedUri = proxyBase + encodeURIComponent(absoluteUri) + "&referer=" + encodeURIComponent(refererHeader) + cookieParam;
                lines[i] = line.replace(`URI="${match[1]}"`, `URI="${wrappedUri}"`);
              }
            }
          }
        }
      }
      const outBuffer = Buffer.from(lines.join('\n'), "utf-8");

      res.status(response.status);
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Content-Length", outBuffer.byteLength);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.send(outBuffer);
    }

    let chunkToWrite = firstChunk;
    let slicedFakePng = false;

    if (chunkToWrite.length > 8 && chunkToWrite[0] === 0x89 && chunkToWrite[1] === 0x50 && chunkToWrite[2] === 0x4E && chunkToWrite[3] === 0x47) {
      let tsOffset = -1;
      for (let i = 0; i < Math.min(chunkToWrite.length, 100000); i++) {
        if (chunkToWrite[i] === 0x47 && chunkToWrite[i + 188] === 0x47 && chunkToWrite[i + 376] === 0x47) {
          tsOffset = i;
          break;
        }
      }
      if (tsOffset !== -1) {
        chunkToWrite = chunkToWrite.slice(tsOffset);
        slicedFakePng = true;
      }
    }

    res.status(response.status);

    const headersToKeep = ["content-type", "accept-ranges", "content-range"];
    if (!slicedFakePng) {
      headersToKeep.push("content-length");
    }

    response.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (headersToKeep.includes(lowerKey)) {
        res.setHeader(key, val);
      }
    });

    if (slicedFakePng || targetUrl.includes('.jpg') || targetUrl.includes('.png') || targetUrl.includes('.ts')) {
      res.setHeader("Content-Type", "video/mp2t");
    } else if (isKey) {
      res.setHeader("Content-Type", "application/octet-stream");
    } else if (targetUrl.includes('.vtt')) {
      res.setHeader("Content-Type", "text/vtt");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    async function* streamGenerator() {
      yield chunkToWrite;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) yield value;
      }
    }

    await pipeline(Readable.from(streamGenerator()), res).catch((err) => {
      if (err.code !== "ERR_STREAM_PREMATURE_CLOSE" && err.name !== "AbortError") {
        console.error("Pipeline streaming error:", err.message);
      }
    });
  } catch (err) {
    if (err.name !== "AbortError" && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
      console.error("Proxy error:", err.message);
      if (!res.headersSent) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.status(500).send("Proxy error");
      }
    }
  }
};

// Endpoint for frontend to report blocked CDN hostnames (self-learning strict CDN detection)
exports.reportBlocked = async (req, res) => {
  try {
    const { hostname } = req.body || {};
    if (!hostname || typeof hostname !== "string") {
      return res.status(400).json({ detail: "Missing hostname" });
    }
    const cleanHost = hostname.replace(/[^a-zA-Z0-9.\-]/g, "").toLowerCase();
    if (cleanHost) {
      serverCache.set("strict_cdn_" + cleanHost, true, 86400); // 24h
      console.log(`[CDN LEARN] Marked ${cleanHost} as strict CDN (reported by client)`);
    }
    res.json({ ok: true, hostname: cleanHost });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};
