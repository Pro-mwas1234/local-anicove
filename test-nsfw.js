const fetch = require('node-fetch');

const query = `
query {
  Page(page: 1, perPage: 10) {
    media(type: ANIME, isAdult: false) {
      id
      title { romaji }
      isAdult
    }
  }
}
`;

async function test() {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
