import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  define: {
    // React Native / Expo global — not defined in the Vitest/Node environment
    __DEV__: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Render React Native components via their web implementation in tests
      "react-native": "react-native-web",
    },
  },
  test: {
    globals: true,
    setupFiles: ["./test/setup.ts"],
    // Unit tests (stores, lib, hooks) run in Node — no DOM overhead
    // Component tests run in jsdom via per-file annotation: @vitest-environment jsdom
    environment: "node",
    coverage: {
      include: ["stores/**", "lib/**", "hooks/**", "components/**"],
      exclude: ["**/*.d.ts"],
    },
  },
});
