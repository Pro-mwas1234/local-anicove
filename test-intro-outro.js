const fetch = require('node-fetch');

const ANILIST_ID = 11061;

async function checkProvider(provider, slug) {
    console.log(`Checking ${provider} with slug ${slug}...`);
    try {
        const res = await fetch(`http://localhost:3000/api/${slug}`);
        if (!res.ok) {
            console.log(`  Failed: ${res.status}`);
            return;
        }
        const data = await res.json();
        
        let introOutroKeys = [];
        if (data.intro) introOutroKeys.push('intro (top-level)');
        if (data.outro) introOutroKeys.push('outro (top-level)');
        if (data.skips) introOutroKeys.push('skips (top-level)');
        
        if (data.sources) {
            for (let i = 0; i < data.sources.length; i++) {
                const src = data.sources[i];
                if (src.intro) introOutroKeys.push(`sources[${i}].intro`);
                if (src.outro) introOutroKeys.push(`sources[${i}].outro`);
                if (src.skips) introOutroKeys.push(`sources[${i}].skips`);
            }
        }
        
        if (introOutroKeys.length > 0) {
            console.log(`  Found intro/outro data:`, introOutroKeys);
            if (data.intro) console.log(`  Intro:`, data.intro);
            if (data.outro) console.log(`  Outro:`, data.outro);
            if (data.skips) console.log(`  Skips:`, data.skips);
        } else {
            console.log(`  No intro/outro data found.`);
        }
    } catch (err) {
        console.log(`  Error:`, err.message);
    }
}

async function run() {
    try {
        const epsRes = await fetch(`http://localhost:3000/api/episodes/${ANILIST_ID}`);
        const epsData = await epsRes.json();
        
        const providers = epsData.providers;
        if (!providers) {
            console.log("No providers found in episodes data.");
            return;
        }
        
        for (const provider of Object.keys(providers)) {
            const providerData = providers[provider];
            if (providerData && providerData.episodes && providerData.episodes.sub && providerData.episodes.sub.length > 0) {
                // The id is already like "watch/ally/11061/sub/allmanga-1"
                const firstEpId = providerData.episodes.sub[0].id;
                await checkProvider(provider, firstEpId);
            } else {
                console.log(`Provider ${provider} has no sub episodes.`);
            }
        }
    } catch (err) {
        console.error("Failed to fetch episodes", err);
    }
}

run();
