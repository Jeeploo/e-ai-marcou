import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "api.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4174",
    channel: "msedge",
    headless: true,
    serviceWorkers: "block",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
    url: "http://127.0.0.1:4174",
    env: {
      VITE_DATA_MODE: "api",
      VITE_PATIENT_ID: "paciente-teste",
      VITE_API_URL: "http://127.0.0.1:8000",
    },
  },
});
