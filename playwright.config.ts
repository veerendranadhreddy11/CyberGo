import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3118",
    launchOptions: process.env.CYBERMISSION_CHROMIUM ? { executablePath: process.env.CYBERMISSION_CHROMIUM } : undefined,
  },
  webServer: {
    command: "python3 -m http.server 3118 --bind 127.0.0.1 --directory out",
    url: "http://127.0.0.1:3118",
    reuseExistingServer: false,
  },
});
