async function test() {
  const proxyUrl = "http://localhost:3000/proxy?url=" + encodeURIComponent("https://mt.nekostream.site/19e67b72b68dd908af1d7e6429ca35fd/master.m3u8") + "&referer=" + encodeURIComponent("https://vidtube.site/");
  console.log("Fetching", proxyUrl);
  try {
    const res = await fetch(proxyUrl);
    console.log("Status:", res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
test();
