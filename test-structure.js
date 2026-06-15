const fetch = require('node-fetch');
const { fetchRawEpisodes } = require('./index');

async function check() {
    const data = await fetch('http://localhost:3000/api/episodes/11061');
    const json = await data.json();
    console.log(JSON.stringify(json.providers.bee.episodes.sub[0], null, 2));
}

check();
