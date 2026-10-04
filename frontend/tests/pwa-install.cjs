const { chromium } = require("@playwright/test");
const { mkdtempSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
(async () => {
  let installed = false;
  const context = await chromium.launchPersistentContext(
    mkdtempSync(join(tmpdir(), "marcou-pwa-final-")),
    { channel: "msedge", headless: false, args: ["--start-minimized"] },
  );
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const manifestId = "http://127.0.0.1:4173/";
  try {
    await page.goto(manifestId);
    await page.evaluate(async () => await navigator.serviceWorker.ready);
    await cdp.send("PWA.install", {
      manifestId,
      installUrlOrBundleUrl: manifestId,
    });
    installed = true;
    await cdp.send("PWA.changeAppUserSettings", { manifestId, displayMode: "standalone" });
    await cdp.send("PWA.openCurrentPageInApp", { manifestId });
    await page.waitForFunction(
      () => matchMedia("(display-mode: standalone)").matches,
      {},
      { timeout: 20000 },
    );
    console.log("PASS: installed window in standalone mode");
    await context.setOffline(true);
    await page.reload();
    await page
      .getByRole("heading", { name: /Olá/ })
      .waitFor({ timeout: 10000 });
    console.log("PASS: installed app opens offline");
  } finally {
    if (installed)
      await cdp.send("PWA.uninstall", { manifestId }).catch(() => {});
    await context.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
