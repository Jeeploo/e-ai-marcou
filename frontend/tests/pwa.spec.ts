import { test, expect } from "./fixtures/app";

test("PWA: shell e painel locais offline; API indisponível e escritas bloqueadas", async ({
  page,
  context,
  api,
}) => {
  test.setTimeout(60000);
  await page.goto("/profissional/ana");
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const advance = page.getByRole("button", {
    name: "Avançar para agendamento",
  });
  await context.setOffline(true);
  await expect(advance).toBeDisabled();
  await context.setOffline(false);
  await expect(advance).toBeEnabled();
  await advance.click();
  const confirm = page.getByRole("button", {
    name: "Confirmar agendamento",
    exact: true,
  });
  await expect(confirm).toBeEnabled();
  await context.setOffline(true);
  await expect(confirm).toBeDisabled();
  await context.setOffline(false);
  await page.goto("/profissional/julia?remarcar=consulta");
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  const reschedule = page.getByRole("button", {
    name: "Confirmar remarcação",
    exact: true,
  });
  await expect(reschedule).toBeEnabled();
  await context.setOffline(true);
  await expect(reschedule).toBeDisabled();
  await context.setOffline(false);
  await page.goto("/agenda");
  const cancel = page.getByRole("button", {
    name: "Cancelar consulta",
    exact: true,
  });
  await expect(cancel).toBeEnabled();
  await context.setOffline(true);
  await expect(cancel).toBeDisabled();
  expect(api.writes).toEqual([]);

  // Actual production SW + real browser network loss. Only API traffic is
  // mocked: HTML, JS, CSS and the manifest must come from the browser cache.
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Minhas consultas" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Você está sem internet");
  await expect(page.locator(".appointment")).toHaveCount(0);
  await expect(page.locator(".offline-notice")).toBeVisible();
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);
  expect(
    await page.evaluate(() =>
      fetch("/not-cached-offline-probe").then(
        () => false,
        () => true,
      ),
    ),
  ).toBe(true);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys.find((k) => k.startsWith("marcou-"))!);
    return (await cache.keys()).map((r) => new URL(r.url).pathname);
  });
  expect(cached).toContain("/index.html");
  expect(cached.some((p) => p.endsWith(".js"))).toBe(true);
  expect(cached.some((p) => p.endsWith(".css"))).toBe(true);
  expect(cached.some((p) => p.startsWith("/api/"))).toBe(false);
  expect(
    await page.evaluate(
      async () => (await (await fetch("/manifest.webmanifest")).json()).display,
    ),
  ).toBe("standalone");

  const trigger = page.getByRole("button", {
    name: "Menu de ferramentas de acessibilidade",
  });
  const openText = async () => {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("button", { name: "Abrir menu de Texto e Leitura" })
      .click();
  };
  await openText();
  const slider = page.getByRole("slider", {
    name: "Tamanho do texto",
    exact: true,
  });
  await slider.fill("150");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.reload();
  await openText();
  await expect(slider).toHaveValue("150");
  await page
    .getByRole("button", { name: "Redefinir todas as configurações" })
    .click();
  await page.keyboard.press("Escape");
  await page.reload();
  await openText();
  await expect(slider).toHaveValue("100");
  await page.keyboard.press("Escape");
  const fresh = await context.newPage();
  await fresh.goto("/perfil/texto");
  await expect(
    fresh.getByRole("button", { name: "Grande", exact: true }),
  ).toBeVisible();
  await fresh.getByRole("button", { name: "Grande", exact: true }).click();
  await fresh.reload();
  await expect(
    fresh.getByRole("button", { name: "Grande", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await fresh.close();
  await page.goto("/busca?visualizacao=mapa");
  await expect(
    page.getByText(
      "O mapa precisa de internet. Reconecte-se para consultar a localização.",
    ),
  ).toBeVisible();
  await expect(page.locator(".region-map")).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText("Você está sem internet");
  await page.goto("/profissional/ana");
  await expect(page.getByRole("alert")).toContainText("Você está sem internet");
  await expect(
    page.getByRole("button", { name: "09:00", exact: true }),
  ).toHaveCount(0);
  expect(api.writes).toEqual([]);
  await context.setOffline(false);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "09:00", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".offline-notice")).toHaveCount(0);
});
