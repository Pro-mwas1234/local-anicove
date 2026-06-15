async function run() {
  const proxyUrl = "http://localhost:3000/proxy?url=" + encodeURIComponent("https://mt.nekostream.site/segment/OD9Ahdg3U16VFqZchzRihy0m6xWuMBhXnasOzMv4JXgsNmrjyB89lMSsVzNDg5SmPi8k7IoVvADx6Z-H94GzQLJmsZpGxx7i6A2n8LT9jGY") + "&referer=" + encodeURIComponent("https://vidtube.site/");
  
  const r = await fetch(proxyUrl);
  const buf = Buffer.from(await r.arrayBuffer());
  console.log("Proxy response size:", buf.length);
  console.log("Proxy response starts with:", buf.slice(0, 4).toString('hex'));
}
run().catch(console.error);
