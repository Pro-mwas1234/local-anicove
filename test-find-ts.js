async function run() {
  const proxyUrl = "http://localhost:3000/proxy?url=" + encodeURIComponent("https://mt.nekostream.site/19e67b72b68dd908af1d7e6429ca35fd/master.m3u8") + "&referer=" + encodeURIComponent("https://vidtube.site/");
  let res = await fetch(proxyUrl);
  let text = await res.text();
  const childM3u8Url = text.split('\n').find(l => l.includes('360.m3u8'));
  
  const childRes = await fetch("http://localhost:3000" + childM3u8Url);
  const childText = await childRes.text();
  const segmentProxyUrl = childText.split('\n').find(l => l.includes('proxy?url='));
  const segUrl = new URL("http://localhost:3000" + segmentProxyUrl).searchParams.get("url");
  
  const r = await fetch(segUrl, { headers: { "Referer": "https://vidtube.site/" } });
  const buf = Buffer.from(await r.arrayBuffer());
  
  console.log("Total size:", buf.length);
  console.log("Starts with PNG:", buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a');
  
  // Find IEND chunk
  const iend = Buffer.from('49454E44ae426082', 'hex');
  const iendIdx = buf.indexOf(iend);
  console.log("IEND found at:", iendIdx);
  
  if (iendIdx !== -1) {
    const tsStart = iendIdx + 8;
    console.log("First byte after IEND:", buf[tsStart].toString(16));
    console.log("Is it TS sync byte (47)?", buf[tsStart] === 0x47);
    
    // If not, let's just search for 0x47
    let syncIdx = -1;
    for (let i = tsStart; i < buf.length; i++) {
        if (buf[i] === 0x47 && buf[i + 188] === 0x47) {
            syncIdx = i;
            break;
        }
    }
    console.log("TS sync byte found at:", syncIdx);
  } else {
    // Search for 0x47 0x40 or similar TS pattern
    let syncIdx = -1;
    for (let i = 0; i < Math.min(buf.length, 100000); i++) {
        if (buf[i] === 0x47 && buf[i + 188] === 0x47 && buf[i + 376] === 0x47) {
            syncIdx = i;
            break;
        }
    }
    console.log("TS sync byte found at:", syncIdx);
  }
}
run().catch(console.error);
