# Streamvault Web — Claude Instructions

## Project
Cross-platform client for Streamvault — web, iOS, and Android from one codebase.
Expo SDK (latest stable) · React Native · TypeScript · NativeWind (Tailwind for RN)

## Stack constraints
- Framework: Expo (managed workflow). Never eject to bare workflow without discussion.
- Styling: NativeWind v4 only. Never StyleSheet.create for layout/spacing/color.
- Navigation: Expo Router (file-based). Never React Navigation configured manually.
- State: Zustand for global state. React Query (TanStack Query) for server state + caching.
- API types: hand-written TypeScript types in `lib/api/`. No codegen — types are kept
  in sync manually when core endpoints change.
- Audio playback: expo-av. Never react-native-track-player unless expo-av proves insufficient.
- Storage (offline): expo-file-system + expo-sqlite for offline track metadata.
- Auth: JWT stored in expo-secure-store. Never AsyncStorage for sensitive data.
- Icons: @expo/vector-icons (Ionicons set). Never custom SVG icons.

## Platform targets
- Web: via Expo for Web (react-native-web). Runs in browser.
- iOS: via Expo Go / EAS Build.
- Android: via Expo Go / EAS Build.
- Watch: NOT in scope here. streamvault-wearos is a separate native Kotlin repo.

## MVP scope
In scope: login, library browse (artists → albums → tracks), basic search, audio playback
with persistent mini-player, "Sync to Watch" button + status indicator, server URL setting.

Post-MVP — do not build yet: register screen, queue management, crossfade/EQ, genres,
smart playlists, watch sync history/management, theme, user profile.

## File structure (Expo Router)
```
app/
  (auth)/         ← login screen
  (tabs)/         ← main tab navigation (library, search, settings)
    library/      ← artists → albums → tracks drill-down
    search/
    settings/     ← server URL config
  _layout.tsx     ← root layout, auth guard
components/
  player/         ← persistent mini-player bar (rendered in root layout)
  library/        ← shared library UI pieces
hooks/            ← custom React hooks
stores/           ← Zustand stores (auth, playback, watch sync status)
lib/
  api/            ← hand-written API types + react-query hooks
  audio/          ← playback logic wrapper around expo-av
```

## Code style
- TypeScript strict mode. No `any`, no `@ts-ignore` without comment.
- All API calls go through React Query hooks in `lib/api/`. Never `fetch()` directly in components.
- Components are presentational. Business logic in hooks and stores.
- Every screen has a loading state, error state, and empty state.

## Testing

Test runner: **Vitest** (`npm test`). Infrastructure is already configured — do not add Jest.

### Rules — always write tests alongside new code

| What you add | What you must write |
|---|---|
| Utility function in `lib/utils/` | Unit test in `lib/utils/<name>.test.ts` |
| API function in `lib/api/` | URL/param construction test in `lib/api/<name>.test.ts` |
| Custom hook in `lib/hooks/` | Hook test using `renderHook` + `createQueryWrapper()` |
| Component in `components/` | Render test + interaction test |
| Zustand store | State transition tests (see `stores/settings.test.ts` as template) |

### Environments
- Default (`node`): stores, utils, hooks — no DOM needed
- Components: add `// @vitest-environment jsdom` at top of the test file

### Patterns

**Mock API modules in hook/screen tests:**
```ts
vi.mock("@/lib/api/library");
const mockedListArtists = vi.mocked(listArtists);
mockedListArtists.mockResolvedValue([...]);
```

**React Query wrapper for `renderHook`:**
```ts
import { createQueryWrapper } from "@/test/utils";
const { result } = renderHook(() => useArtists(), { wrapper: createQueryWrapper() });
```

**Component tests use `@testing-library/react` (not the RN variant) — `react-native-web` handles the aliasing.**

### Coverage target
`npm run test:coverage` — keep `lib/` and `components/` above **80%**.

## Do NOT
- Eject from Expo managed workflow
- Use StyleSheet.create for anything NativeWind can handle
- Store JWT in AsyncStorage
- Write platform-specific code without `.ios.tsx` / `.android.tsx` / `.web.tsx` suffixes
- Fetch directly in components
- Add dependencies without confirming first
- Build post-MVP features (queue, register, EQ, genres, etc.)
