exports.proxy = async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No url provided");

    let customReferer = req.query.referer;
    
    if (targetUrl.includes('owocdn.top') || targetUrl.includes('uwucdn.top') || targetUrl.includes('bigdreamsmalldih.site')) {
        customReferer = 'https://kwik.cx/';
    }
    
    if (targetUrl.includes('nekostream.site') || targetUrl.includes('ipstatp.com')) {
        customReferer = 'https://vidtube.site/';
    }

    if (targetUrl.includes('wixmp.com') || targetUrl.includes('203.188.') || targetUrl.includes('allmanga') || customReferer?.includes('fallanime')) {
        customReferer = 'https://allmanga.to/';
    }

    const refererHeader = customReferer ? customReferer : new URL(targetUrl).origin + "/";
    let originHeader = "";
    try {
      originHeader = new URL(refererHeader).origin;
    } catch (e) {
      originHeader = new URL(targetUrl).origin;
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": refererHeader,
      "Origin": originHeader,
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    const response = await fetch(targetUrl, { headers });
    let buffer = Buffer.from(await response.arrayBuffer());

    const isKey = targetUrl.includes('.key');
    let isM3u8 = false;
    
    if (!isKey && buffer.byteLength > 7) {
        const header = Buffer.from(buffer.slice(0, 7)).toString('utf-8');
        if (header === '#EXTM3U') {
            isM3u8 = true;
        }
    }

    if (isM3u8) {
      let text = Buffer.from(buffer).toString("utf-8");
      const baseUrl = new URL(targetUrl);
      const lines = text.split('\n');
      
      const proxyBase = `/proxy?url=`; 

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line && !line.startsWith('#')) {
          let absoluteUrl = line.startsWith('http') ? line : new URL(line, baseUrl).href;
          lines[i] = proxyBase + encodeURIComponent(absoluteUrl) + "&referer=" + encodeURIComponent(refererHeader);
          
        } else if (line.includes('URI="')) {
          const match = line.match(/URI="([^"]+)"/);
          if (match) {
            let uri = match[1];
            if (!uri.startsWith('data:')) {
              let absoluteUri = uri.startsWith('http') ? uri : new URL(uri, baseUrl).href;
              let wrappedUri = proxyBase + encodeURIComponent(absoluteUri) + "&referer=" + encodeURIComponent(refererHeader);
              lines[i] = line.replace(`URI="${match[1]}"`, `URI="${wrappedUri}"`);
            }
          }
        }
      }
      text = lines.join('\n');
      buffer = Buffer.from(text, "utf-8");
    }

    res.status(response.status);

    const headersToKeep = ["content-type", "accept-ranges", "content-range"];
    response.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (headersToKeep.includes(lowerKey)) {
        res.setHeader(key, val);
      }
    });

    if (isM3u8) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    } else if (isKey) {
        res.setHeader("Content-Type", "application/octet-stream");
    } else if (targetUrl.includes('.jpg') || targetUrl.includes('.png') || targetUrl.includes('.ts')) {
        res.setHeader("Content-Type", "video/mp2t");
    } else if (targetUrl.includes('.vtt')) {
        res.setHeader("Content-Type", "text/vtt");
    }

    if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        let tsOffset = -1;
        for (let i = 0; i < Math.min(buffer.length, 100000); i++) {
            if (buffer[i] === 0x47 && buffer[i + 188] === 0x47 && buffer[i + 376] === 0x47) {
                tsOffset = i;
                break;
            }
        }
        if (tsOffset !== -1) {
            buffer = buffer.slice(tsOffset);
            res.setHeader("Content-Type", "video/mp2t");
        }
    }

    res.setHeader("Content-Length", buffer.byteLength);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization");

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy error");
  }
};
