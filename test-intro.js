async function test() {
  const epsRes = await fetch("http://localhost:3000/api/episodes/21");
  const data = await epsRes.json();
  const beeEps = data.providers?.bee?.episodes?.sub || [];
  const ep = beeEps[0];
  
  if (!ep) return;
  const slug = `${ep.id.includes(":") ? ep.id.split(":")[0] : ep.id}-${ep.number}`;
  const watchRes = await fetch(`http://localhost:3000/api/watch/bee/21/sub/${slug}`);
  const watchData = await watchRes.json();
  
  if (watchData.intro || watchData.outro) {
    console.log("Found intro/outro at top level", watchData.intro, watchData.outro);
  }
  if (watchData.ssub?.intro || watchData.ssub?.outro) {
    console.log("Found intro/outro in ssub", watchData.ssub.intro, watchData.ssub.outro);
  }
}
test().catch(console.error);
