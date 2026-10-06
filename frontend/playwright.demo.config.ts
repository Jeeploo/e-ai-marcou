import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "demo.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4175",
    headless: true,
    serviceWorkers: "block",
  },
  webServer: [
    {
      command:
        "../backend/.venv/bin/python -m uvicorn app.main:app --app-dir ../backend --host 127.0.0.1 --port 8001",
      url: "http://127.0.0.1:8001/api/health",
      env: { DATA_MODE: "demo", CORS_ORIGINS: "http://127.0.0.1:4175" },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4175 --strictPort",
      url: "http://127.0.0.1:4175",
      env: {
        VITE_API_URL: "http://127.0.0.1:8001",
        VITE_PATIENT_ID: "paciente-playwright-demo",
      },
    },
  ],
});
