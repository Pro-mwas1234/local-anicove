async function test() {
  const epsRes = await fetch("http://localhost:3000/api/episodes/21");
  const data = await epsRes.json();
  const beeEps = data.providers?.bee?.episodes?.sub || [];
  const ep = beeEps[0];
  
  if (!ep) {
    console.log("No episode found in bee");
    return;
  }
  const origId = ep.id;
  const prefix = origId.includes(":") ? origId.split(":")[0] : origId;
  const slug = `${prefix}-${ep.number}`;
  
  const watchRes = await fetch(`http://localhost:3000/api/watch/bee/21/sub/${slug}`);
  const watchData = await watchRes.json();
  console.log(JSON.stringify(watchData, null, 2));
}

test().catch(console.error);
