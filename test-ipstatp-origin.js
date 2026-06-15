async function run() {
  const proxyUrl = "http://localhost:3000/proxy?url=" + encodeURIComponent("https://mt.nekostream.site/19e67b72b68dd908af1d7e6429ca35fd/master.m3u8") + "&referer=" + encodeURIComponent("https://vidtube.site/");
  let res = await fetch(proxyUrl);
  let text = await res.text();
  const childM3u8Url = text.split('\n').find(l => l.includes('360.m3u8'));
  
  const childRes = await fetch("http://localhost:3000" + childM3u8Url);
  const childText = await childRes.text();
  const segmentProxyUrl = childText.split('\n').find(l => l.includes('proxy?url='));
  
  if (!segmentProxyUrl) {
    console.log("No segment found");
    return;
  }
  
  const segUrl = new URL("http://localhost:3000" + segmentProxyUrl).searchParams.get("url");
  console.log("Segment URL:", segUrl);
  
  // Test 1: With Origin
  const r1 = await fetch(segUrl, { headers: { "Referer": "https://vidtube.site/", "Origin": "https://vidtube.site" } });
  const b1 = Buffer.from(await r1.arrayBuffer());
  console.log("With Origin:", b1.slice(0, 4).toString('hex'));
  
  // Test 2: Without Origin
  const r2 = await fetch(segUrl, { headers: { "Referer": "https://vidtube.site/" } });
  const b2 = Buffer.from(await r2.arrayBuffer());
  console.log("Without Origin:", b2.slice(0, 4).toString('hex'));
}
run().catch(console.error);
