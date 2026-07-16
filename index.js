require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const apiRoutes = require("./src/routes/apiRoutes");
const proxyController = require("./src/controllers/proxyController");

const app = express();
app.disable("x-powered-by");

// Session middleware — uses file-based storage so sessions survive server restarts
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "sessions"),
      ttl: 365 * 24 * 60 * 60, // 1 year in seconds (matches maxAge)
      retries: 0,
      reapInterval: 86400, // clean up expired sessions every 24h
      secret: process.env.SESSION_SECRET || "anicove-session-secret-2026", // encrypt session files at rest
    }),
    secret: process.env.SESSION_SECRET || "anicove-session-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (same as AniList token lifetime)
      sameSite: "lax",
    },
  })
);

// Serve production build if exists with static asset caching
app.use(express.static(path.join(__dirname, "client", "dist"), {
  maxAge: "1y",
  etag: true,
  index: false,
}));
app.use(express.json());

// Mount API Routes
app.use("/api", apiRoutes);

// Mount Proxy Routes
app.use("/proxy", proxyController.proxy);
app.post("/proxy/report-blocked", proxyController.reportBlocked);

// SPA fallback — serve React app for all other routes
app.use((req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Start server only when run directly (not imported for testing)
if (require.main === module) {
  const readline = require("readline");
  const net = require("net");

  const checkPort = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", (err) => {
        if (err.code === "EADDRINUSE") {
          resolve(false);
        } else {
          resolve(false);
        }
      });
      server.once("listening", () => {
        server.close();
        resolve(true);
      });
      server.listen(port, "127.0.0.1");
    });
  };

  const defaultPort = parseInt(process.env.PORT, 10) || 3000;

  if (process.env.NO_PROMPT === "true") {
    let httpsOptions = null;
    try {
      httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, "localhost.key")),
        cert: fs.readFileSync(path.join(__dirname, "localhost.crt")),
      };
    } catch (e) {
      console.error("❌ SSL certificate files not found. Run: openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -subj \"//CN=localhost\"");
      process.exit(1);
    }

    const server = https.createServer(httpsOptions, app).listen(defaultPort, () => {
      console.log(`\n✅ Server successfully started on https://localhost:${defaultPort} (HTTPS)`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${defaultPort} is already in use by another process!`);
        console.error(`Please close any existing running instance of Anicove (or run 'taskkill /F /IM node.exe' on Windows) and try again.\n`);
      } else {
        console.error(`\n❌ Server error:`, err.message);
      }
      process.exit(1);
    });
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("==========================================");
    console.log(" Welcome to Anicove Server! ");
    console.log("==========================================");
    console.log("Please specify the port to run the server on.");
    console.log("Valid ports are generally between 1024 and 65535.");
    console.log("------------------------------------------\n");

    const promptForPort = () => {
      rl.question("Enter port [Default: 3010]: ", async (answer) => {
        const input = answer.trim();
        const port = input === "" ? 3010 : parseInt(input, 10);

        if (isNaN(port) || port < 1024 || port > 65535) {
          console.log("❌ Invalid port. Please enter a valid number (1024 - 65535).\n");
          return promptForPort();
        }

        console.log(`Checking if port ${port} is available...`);
        const isFree = await checkPort(port);
        
        if (!isFree) {
          console.log(`❌ Port ${port} is currently in use! Please choose another port.\n`);
          return promptForPort();
        }

        const server = app.listen(port, () => {
          console.log("\n✅ Server successfully started!");
          console.log("==========================================");
          console.log("To access the platform, open your browser to:");
          console.log(`➔  http://localhost:${port}`);
          console.log("==========================================");
        });
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
        rl.close();
      });
    };

    promptForPort();
  }
}

module.exports = app;
