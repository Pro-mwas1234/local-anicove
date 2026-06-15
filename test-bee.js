const { Buffer } = require("buffer");
const zlib = require("zlib");
const util = require("util");
const gunzip = util.promisify(zlib.gunzip);

const MIRURO_PIPE_URL = "https://www.miruro.tv/api/secure/pipe";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json, text/plain, */*",
  "Referer": "https://www.miruro.tv/",
  "Content-Type": "application/json"
};

function encodePipeRequest(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

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

async function testFetchAll() {
  const anilistId = 11061;
  const provider = "bee";
  const category = "sub";

  console.log(`Fetching raw episodes for ${anilistId}...`);
  const epPayload = {
    path: "episodes",
    method: "GET",
    query: { id: anilistId },
    body: null,
    version: "0.1.0",
  };
  const epRes = await fetch(`${MIRURO_PIPE_URL}?e=${encodePipeRequest(epPayload)}`, { headers: HEADERS });
  const epText = (await epRes.text()).trim();
  const data = await decodePipeResponse(epText);
  
  const epList = data.providers[provider]?.episodes[category] || [];
  console.log(`Found ${epList.length} episodes for ${provider}.`);

  // Test specifically episode 59
  const ep = epList.find(e => e.number === 59);
  if (!ep) {
    console.log("Episode 59 not found for bee provider.");
    return;
  }
  
  const origId = ep.id;
  console.log(`Testing episode ${ep.number} (id: ${origId})`);
  
  const encId = Buffer.from(origId).toString("base64url");
  const payload = {
    path: "sources",
    method: "GET",
    query: { episodeId: encId, provider, category, anilistId },
    body: null,
    version: "0.1.0",
  };
  
  const res = await fetch(`${MIRURO_PIPE_URL}?e=${encodePipeRequest(payload)}`, { headers: HEADERS });
  const text = (await res.text()).trim();
  const finalData = await decodePipeResponse(text);
  
  console.log(JSON.stringify(finalData, null, 2));
}

testFetchAll().catch(console.error);
