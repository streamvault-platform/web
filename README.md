# streamvault-web

[![CI](https://github.com/streamvault-platform/web/actions/workflows/ci.yml/badge.svg)](https://github.com/streamvault-platform/web/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-55-000020?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey?logo=react)](https://reactnative.dev)

Cross-platform client for Streamvault — web, iOS, and Android via Expo + React Native.

**Stack:** Expo SDK · React Native · TypeScript · NativeWind · Expo Router · Zustand · TanStack Query

## Quick start

```bash
npm install
npm run start          # Expo dev server (scan QR for iOS/Android, press W for web)
```

Point the app at your Streamvault instance via Settings → Server URL.

## Hosting the web client

### 1. Bundled with the platform (recommended)

The web client ships as part of the stack. Envoy is the single entry point — it routes `/api/`, `/stream/`, and `/ws/` to core and everything else to the web container. No server URL config needed; `window.location.origin` resolves correctly.

```bash
docker compose up -d
# or: helm install streamvault oci://ghcr.io/streamvault-platform/charts/streamvault
```

Point your reverse proxy at **Envoy only** and terminate TLS there — one upstream, one certificate.

```
your reverse proxy (TLS) → Envoy :8080 → core  (/api/, /stream/, /ws/)
                                        → web   (/*)
```

### 2. Split deployment (web and backend on separate servers)

Host the web client independently (separate server, Vercel, Netlify, S3, etc.). Because web and API are on different origins you need TLS configured in **two places** — once for the backend (your reverse proxy in front of Envoy) and once for the frontend server.

You also need to point the app at the backend. Two ways to do this:

**Option A — bake the URL in at build time** (static hosting, CDN):
```bash
STREAMVAULT_PUBLIC_API_URL=https://api.myserver.com npx expo export --platform web
```
Or as a Docker build arg:
```bash
docker build \
  --build-arg STREAMVAULT_PUBLIC_API_URL=https://api.myserver.com \
  -t streamvault-web .
```

**Option B — inject at container startup** (same image, different environments):
```bash
# docker-compose.yml or docker run -e
STREAMVAULT_API_URL=https://api.myserver.com
```
The container's entrypoint patches the URL into the JS bundle at startup — no rebuild needed.

### 3. Native app (iOS / Android)

No configuration needed at build time. The user enters the server URL in Settings on first launch; the app stores it in secure-store on the device.

## Related

- [streamvault-core](../core) — backend API
- [streamvault-infra](../infra) — `docker compose up -d` to run the full stack locally
