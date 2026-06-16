Version: 1.0.0

# Setup Documentation

This guide will walk you through setting up and running LocalLink locally for development or production use.

## Prerequisites

- **Node.js** (v20+ recommended)
- **Git**

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/USER/LocalLink.git
   cd LocalLink
   ```

2. **Install Backend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

4. **Start the Development Servers:**
   - For the **backend** (API), run `npm run dev` in the root folder. It will start on `http://localhost:3000`.
   - For the **frontend** (React UI), run `npm run dev` in the `client` folder. It will start on `http://localhost:5173`.

## Production Build

To build the React application for production so that it is served natively by the Express server:

```bash
cd client
npm run build
```

Then, you can start the optimized production server:
```bash
node index.js
```
The entire application will be accessible at `http://localhost:3000`.

## Building Standalone Executables (Linux / Windows)

LocalLink uses `pkg` to bundle the Node.js server and React frontend into single, portable executable files that do not require Node.js to be installed on the target machine.

1. Ensure you have built the React frontend:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. Run the packaging script:
   ```bash
   npm run package
   ```

3. The executables will be generated in the `dist-bin/` directory:
   - `locallink-linux`
   - `locallink-win.exe`

## Changing the Port

By default, the server runs on port `3000`. If this port is in use, or if you prefer a different port, you can set the `PORT` environment variable before running the application:

**Linux / macOS:**
```bash
PORT=8080 node index.js
```

**Windows (CMD):**
```cmd
set PORT=8080
node index.js
```

**Windows (PowerShell):**
```powershell
$env:PORT=8080
node index.js
```

## Docker Setup

LocalLink provides a Dockerized environment for easy deployment. The provided `docker-compose.yml` sets up the Node.js application alongside an Nginx reverse proxy.

1. Ensure Docker and Docker Compose are installed on your machine.
2. From the root directory of the project, run:
   ```bash
   docker-compose up -d
   ```
3. The application will be built and accessible via the Nginx proxy at `http://localhost:3010`.

To stop the containers, run:
```bash
docker-compose down
```
