const fetch = require('node-fetch');

const ANIME_IDS = [11061, 113415, 151807, 16498]; // HxH, JJK, Solo Leveling, Attack on Titan

async function checkProvider(provider, slug) {
    try {
        const res = await fetch(`http://localhost:3000/api/${slug}`);
        if (!res.ok) {
            return;
        }
        const data = await res.json();
        
        let introOutroKeys = [];
        if (data.intro) introOutroKeys.push('intro');
        if (data.outro) introOutroKeys.push('outro');
        if (data.skips) introOutroKeys.push('skips');
        
        if (data.sources) {
            for (let i = 0; i < data.sources.length; i++) {
                const src = data.sources[i];
                if (src.intro) introOutroKeys.push(`sources[${i}].intro`);
                if (src.outro) introOutroKeys.push(`sources[${i}].outro`);
                if (src.skips) introOutroKeys.push(`sources[${i}].skips`);
            }
        }
        
        if (introOutroKeys.length > 0) {
            console.log(`[${slug}] Found intro/outro data:`, introOutroKeys);
            if (data.intro) console.log(`  Intro:`, data.intro);
            if (data.outro) console.log(`  Outro:`, data.outro);
            if (data.skips) console.log(`  Skips:`, data.skips);
        }
    } catch (err) {
        // Ignore
    }
}

async function run() {
    for (const anilistId of ANIME_IDS) {
        console.log(`\n--- Fetching episodes for Anime ${anilistId} ---`);
        try {
            const epsRes = await fetch(`http://localhost:3000/api/episodes/${anilistId}`);
            const epsData = await epsRes.json();
            
            const providers = epsData.providers;
            if (!providers) continue;
            
            const checks = [];
            for (const provider of Object.keys(providers)) {
                const providerData = providers[provider];
                if (providerData && providerData.episodes && providerData.episodes.sub && providerData.episodes.sub.length > 0) {
                    const firstEpId = providerData.episodes.sub[0].id;
                    const middleEpId = providerData.episodes.sub[Math.floor(providerData.episodes.sub.length / 2)].id;
                    checks.push(checkProvider(provider, firstEpId));
                    checks.push(checkProvider(provider, middleEpId));
                }
            }
            await Promise.all(checks);
        } catch (err) {
            console.error("Failed to fetch episodes", err);
        }
    }
}

run();
