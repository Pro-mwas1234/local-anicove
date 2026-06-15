const fetch = require('node-fetch');

async function run() {
    try {
        const res = await fetch('http://localhost:3000/api/skips/11061/1');
        console.log(res.status);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}
run();
