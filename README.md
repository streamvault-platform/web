# streamvault-web

Cross-platform client for Streamvault — web, iOS, and Android via Expo + React Native.

**Stack:** Expo SDK · React Native · TypeScript · NativeWind · Expo Router · Zustand · TanStack Query

## Quick start

```bash
npm install
npm run start          # Expo dev server (scan QR for iOS/Android, press W for web)
```

Point the app at your Streamvault instance via Settings → Server URL.

## Hosting the web client

Three deployment modes are supported. Which one to use depends on how you run the platform.

### 1. Docker Compose / Helm (bundled with the platform)

The recommended path for self-hosters. The web client ships as part of the stack and the API URL is injected at container startup — no rebuild required.

```bash
# .env (Docker Compose)
WEB_PORT=3000
STREAMVAULT_API_URL=https://api.myserver.com   # URL of the API as seen by the browser
                                               # leave empty when web + API share an origin
```

```yaml
# values.yaml (Helm)
sv:
  web:
    apiUrl: "https://api.myserver.com"
```

When `STREAMVAULT_API_URL` / `apiUrl` is empty the app falls back to `window.location.origin`. This is the right default when a reverse proxy (e.g. Caddy) serves both web and API on the same domain — no configuration needed.

### 2. Static hosting (Netlify, Vercel, S3, etc.)

Build the web export with the API URL baked in at build time. The Expo `EXPO_PUBLIC_` prefix is an internal requirement and stays hidden — use `STREAMVAULT_PUBLIC_API_URL` in all contexts.

```bash
# Build and deploy the dist/ directory to your static host
STREAMVAULT_PUBLIC_API_URL=https://api.myserver.com npx expo export --platform web
```

Or pass it as a Docker build arg to produce a pre-configured image:

```bash
docker build \
  --build-arg STREAMVAULT_PUBLIC_API_URL=https://api.myserver.com \
  -t streamvault-web .
```

### 3. Native app (iOS / Android)

No configuration needed at build time. The user enters the server URL in Settings on first launch and the app stores it in secure-store on the device. Each user points the app at their own Streamvault instance.

## Related

- [streamvault-core](../core) — backend API
- [streamvault-infra](../infra) — `docker compose up -d` to run the full stack locally
