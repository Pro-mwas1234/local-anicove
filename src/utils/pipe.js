const zlib = require("zlib");
const util = require("util");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const proxyRotator = require("./proxyRotator");

const gunzip = util.promisify(zlib.gunzip);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
  Referer: "https://www.miruro.tv/",
  Origin: "https://www.miruro.tv",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Ch-Ua": '"Microsoft Edge";v="136", "Chromium";v="136", "Not.A/Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};
const MIRURO_PIPE_URL = process.env.MIRURO_PIPE_URL || "https://www.miruro.tv/api/secure/pipe";

async function decodePipeResponse(encodedStr) {
  try {
    let padded = encodedStr;
    const pad = encodedStr.length % 4;
    if (pad) padded += "=".repeat(4 - pad);
    const base64Str = padded.replace(/-/g, "+").replace(/_/g, "/");
    const compressed = Buffer.from(base64Str, "base64");
    const decompressed = await gunzip(compressed);
    return JSON.parse(decompressed.toString("utf-8"));
  } catch (err) {
    throw new Error("Failed to decode pipe response");
  }
}

function encodePipeRequest(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

let cycleTLSInstance = null;

async function getCycleTLS() {
  if (!cycleTLSInstance) {
    if (process.platform !== "win32") {
      try {
        const distDir = path.join(path.dirname(require.resolve("cycletls/package.json")), "dist");
        if (fs.existsSync(distDir)) {
          fs.readdirSync(distDir).forEach((f) => {
            if (!f.endsWith(".js") && !f.endsWith(".ts") && !f.endsWith(".map") && !f.endsWith(".json")) {
              try { fs.chmodSync(path.join(distDir, f), 0o755); } catch (e) {}
            }
          });
        }
      } catch (e) {}
    }
    const cycleModule = await import("cycletls");
    const initCycleTLS = cycleModule.default || cycleModule;
    cycleTLSInstance = await initCycleTLS();
  }
  return cycleTLSInstance;
}

async function fetchUpstreamPipe(encodedReq, headers = {}) {
  let pipeUrl = process.env.MIRURO_PIPE_URL || "https://www.miruro.tv/api/secure/pipe";
  if (pipeUrl.includes("8191") || pipeUrl.endsWith("/v1")) {
    pipeUrl = "https://www.miruro.tv/api/secure/pipe";
  }

  let customHeaders = { ...HEADERS, ...getHarvestedHeaders(), ...headers };
  let targetUrl = `${pipeUrl}?e=${encodedReq}`;

  // Use CycleTLS to perform native TLS JA3 impersonation outside of test environments
  if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
    try {
      const client = await getCycleTLS();
      const cycleOptions = {
        timeout: 8,
        ja3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0",
        userAgent: customHeaders["User-Agent"] || HEADERS["User-Agent"],
        headers: customHeaders,
        responseType: "text",
      };

      // Route through residential proxy if configured (bypasses Cloudflare datacenter blocks)
      const proxyUrl = getProxyUrl();
      if (proxyUrl) {
        cycleOptions.proxy = proxyUrl;
      }

      const resp = await client(targetUrl, cycleOptions, "get");
      if (resp.status < 500) {
        return {
          ok: resp.status >= 200 && resp.status < 300,
          status: resp.status,
          text: async () => (resp.data ? resp.data.toString("utf-8") : ""),
        };
      }
    } catch (err) {
      console.error("CycleTLS failed, falling back to standard fetch:", err.message);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  return fetchWithProxy(targetUrl, { headers: customHeaders, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

function getProxyUrl() {
  return process.env.PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null;
}

function getProxyUrlAsync() {
  const staticProxy = process.env.PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (staticProxy) return Promise.resolve(staticProxy);
  // Fall back to free proxy rotator when no static proxy is configured
  return proxyRotator.getWorkingProxy();
}

async function getFetchAgent(targetUrl, proxyUrl) {
  const url = proxyUrl || getProxyUrl();
  if (!url) return null;
  return proxyRotator.getProxyAgent(url, targetUrl);
}
}

async function fetchWithProxy(url, options = {}) {
  let proxyUrl = getProxyUrl();
  
  // If no static proxy, try rotator
  if (!proxyUrl && (!options._proxyTried)) {
    proxyUrl = await getProxyUrlAsync();
    options = { ...options, _proxyTried: true };
  }
  
  if (!proxyUrl) {
    return fetch(url, options);
  }

  // Use Node's https/http module with proxy agent for proxied requests
  const isHttps = url.startsWith("https");
  const mod = isHttps ? https : http;
  const agent = await getFetchAgent(url, proxyUrl);

  if (!agent) return fetch(url, options);

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = mod.request(
      url,
      {
        agent,
        method: options.method || "GET",
        headers: {
          ...options.headers,
          Host: parsedUrl.hostname,
        },
        timeout: options.signal ? undefined : 8000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: async () => data,
            headers: {
              get: (key) => res.headers[key.toLowerCase()] || null,
            },
          });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        req.destroy();
        reject(new Error("Request aborted"));
      }, { once: true });
    }

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function getHarvestedHeaders() {
  const headers = {};
  const clearance = process.env.CF_CLEARANCE_MIRURO || process.env.CF_CLEARANCE;
  if (clearance) {
    let cookieVal = clearance.trim();
    if (!cookieVal.includes("=")) cookieVal = `cf_clearance=${cookieVal}`;
    headers["Cookie"] = cookieVal;
  }
  if (process.env.CF_USER_AGENT) {
    headers["User-Agent"] = process.env.CF_USER_AGENT;
  }
  return headers;
}

module.exports = {
  HEADERS,
  MIRURO_PIPE_URL,
  decodePipeResponse,
  encodePipeRequest,
  fetchUpstreamPipe,
  getCycleTLS,
  getHarvestedHeaders,
  getProxyUrl,
  getFetchAgent,
  fetchWithProxy,
};
