import { test, expect, chromium } from "@playwright/test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("CEP preenche endereço e permite corrigir campos", async ({ page }) => {
  await page.route("https://viacep.com.br/ws/01001000/json/", (route) =>
    route.fulfill({
      json: {
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      },
    }),
  );
  await page.goto("/perfil/enderecos");
  await page.getByRole("button", { name: "Adicionar endereço" }).click();
  await page
    .getByRole("textbox", { name: "CEP", exact: true })
    .fill("01001-000");
  await page.getByRole("button", { name: "Buscar CEP", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Rua / Avenida" }),
  ).toHaveValue("Praça da Sé");
  await page
    .getByRole("textbox", { name: "Rua / Avenida" })
    .fill("Praça da Sé corrigida");
  await expect(
    page.getByRole("textbox", { name: "Cidade", exact: true }),
  ).toHaveValue("São Paulo");
});
test("mapa Google acompanha a clínica selecionada", async ({ page }) => {
  await page.goto("/busca?visualizacao=mapa");
  await expect(page.locator(".region-map")).toHaveAttribute(
    "src",
    /www.google.com\/maps\?q=/,
  );
  await page.getByRole("button", { name: "Mostrar no mapa" }).nth(1).click();
  await expect(page).toHaveURL(/destaque=/);
});
test("inspeção visual, console e critérios de instalação", async () => {
  const dir = await mkdtemp(join(tmpdir(), "marcou-pwa-"));
  const context = await chromium.launchPersistentContext(dir, {
    headless: true,
    baseURL: "http://127.0.0.1:4173",
  });
  const page = await context.newPage();
  try {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    const cdp = await context.newCDPSession(page);
    const eligibility = await cdp.send("Page.getInstallabilityErrors");
    console.log("Installability:", JSON.stringify(eligibility));
    expect(eligibility.installabilityErrors).toEqual([]);
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "/",
        "/busca?visualizacao=mapa",
        "/profissional/ana",
        "/agenda",
        "/perfil/dados",
      ]) {
        await page.goto(route);
        await page.waitForTimeout(route.includes("mapa") ? 3000 : 250);
        await page.screenshot({
          path: `test-results/visual-${width}-${route.split("?")[0].replaceAll("/", "_") || "home"}.png`,
          fullPage: true,
        });
      }
    }
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
