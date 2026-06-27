const NodeCache = require("node-cache");

const serverCache = new NodeCache({ stdTTL: 3600 }); // Default 1 hr TTL

module.exports = serverCache;
