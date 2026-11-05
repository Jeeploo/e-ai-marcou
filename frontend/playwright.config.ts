import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testIgnore: ["api.spec.ts", "demo.spec.ts", "location-ranking.spec.ts"],
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "../backend/.venv/bin/python -m uvicorn app.main:app --app-dir ../backend --host 127.0.0.1 --port 8000",
      url: "http://127.0.0.1:8000/api/health",
      env: { DATA_MODE: "demo", CORS_ORIGINS: "http://127.0.0.1:4173" },
    },
    {
      command:
        "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
      env: { VITE_API_URL: "http://127.0.0.1:8000" },
    },
  ],
  reporter: "list",
});
