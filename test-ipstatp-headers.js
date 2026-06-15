async function testFetch(headers) {
  const url = "https://p1.ipstatp.com/obj/ad-site-i18n/202604125d0df5bab0b298484f3ab6cc";
  const res = await fetch(url, { headers });
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.slice(0, 4).toString('hex');
}

async function run() {
  const h1 = { "User-Agent": "Mozilla/5.0" };
  console.log("No referer:", await testFetch(h1));

  const h2 = { "User-Agent": "Mozilla/5.0", "Referer": "https://vidtube.site/" };
  console.log("vidtube referer:", await testFetch(h2));

  const h3 = { "User-Agent": "Mozilla/5.0", "Referer": "https://mt.nekostream.site/" };
  console.log("nekostream referer:", await testFetch(h3));
  
  const h4 = { "User-Agent": "Mozilla/5.0", "Referer": "https://megaplay.buzz/" };
  console.log("megaplay referer:", await testFetch(h4));
}
run();
