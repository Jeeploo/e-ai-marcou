import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ serviceWorkers: "block" });
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    let json: unknown = [];
    if (url.pathname.endsWith("/especialidades"))
      json = [{ id: "cardio", nome: "Cardiologia" }];
    if (url.pathname.endsWith("/clinicas"))
      json = [
        {
          id: "clinica",
          nome: "Clínica teste",
          endereco: "Rua teste, 1",
          cidade: "Recife",
          uf: "PE",
        },
      ];
    if (url.pathname.endsWith("/profissionais"))
      json = [
        {
          id: "ana",
          nome: "Dra. Ana Lima",
          especialidadeId: "cardio",
          clinicaId: "clinica",
          valorConsulta: 180,
          ativo: true,
        },
      ];
    if (url.pathname.endsWith("/agendamentos"))
      json = [
        {
          id: "consulta",
          profissionalId: "ana",
          data: "2099-12-20",
          hora: "09:00",
          valor: 180,
          status: "agendado",
        },
      ];
    await route.fulfill({ json });
  });
});

for (const width of [320, 375, 1440]) {
  test(`módulo integrado: teclado, rotas e preferências em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/perfil/texto");
    const trigger = page.getByRole("button", {
      name: "Menu de ferramentas de acessibilidade",
    });
    const openText = async () => {
      await trigger.click();
      await page
        .getByRole("button", { name: "Abrir menu de Texto e Leitura" })
        .click();
    };
    await expect(page.locator("#a11y-widget-root")).toHaveCount(1);
    await expect(
      page.locator("[data-a11y-content] #a11y-widget-root"),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Grande", exact: true }).click();
    await openText();
    const slider = page.getByRole("slider", {
      name: "Tamanho do texto",
      exact: true,
    });
    await expect(slider).toHaveValue("125");
    await slider.fill("150");
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(i % 2 ? "Tab" : "Shift+Tab");
      expect(
        await page.evaluate(
          () => !!document.activeElement?.closest("#a11y-panel"),
        ),
      ).toBe(true);
    }
    expect(
      (await new AxeBuilder({ page }).include("#a11y-panel").analyze())
        .violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Grande", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    for (const route of [
      "/",
      "/busca",
      "/agenda",
      "/perfil",
      "/profissional/ana",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
      // A filter must not move fixed navigation when scrolling.
      await trigger.click();
      await page
        .getByRole("button", { name: "Abrir menu de Configurações Visuais" })
        .click();
      await page
        .getByRole("button", { name: "Alto Contraste", exact: true })
        .click();
      await page.keyboard.press("Escape");
      const before = await page.locator(".sidebar").boundingBox();
      await page.evaluate(() => window.scrollTo(0, 400));
      const after = await page.locator(".sidebar").boundingBox();
      expect(after!.y).toBeCloseTo(before!.y, 0);
    }
    await page.goto("/agenda");
    await page.getByRole("button", { name: "Ver detalhes" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await page.goto("/");
    const heading = page.locator("main h1");
    const size = await heading.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
    await openText();
    await expect(slider).toHaveValue("150");
    await slider.fill("200");
    await page.keyboard.press("Escape");
    await expect
      .poll(() =>
        heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      )
      .toBeCloseTo((size * 200) / 150, 1);
    await openText();
    await page
      .getByRole("button", { name: "Redefinir todas as configurações" })
      .click();
    await page.keyboard.press("Escape");
    await page.reload();
    await openText();
    await expect(slider).toHaveValue("100");
    await page.waitForTimeout(350); // Capture the completed submenu transition.
    await page.screenshot({ path: `/tmp/marcou-a11y-${width}.png` });
    await page.keyboard.press("Escape");
    await page.goto("/perfil/texto");
    await expect(
      page.getByRole("button", { name: "Normal", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });
}

test("migra texto antigo e respeita preferência nova após reset", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "marcou:profile",
      JSON.stringify({
        patient: { nome: "Teste" },
        addresses: [],
        textSize: "large",
      }),
    );
  });
  await page.goto("/perfil/texto");
  await expect(
    page.getByRole("button", { name: "Grande", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Menu de ferramentas de acessibilidade" })
    .click();
  await page
    .getByRole("button", { name: "Redefinir todas as configurações" })
    .click();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Normal", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("posições inferiores liberam navegação mobile e escala preserva o painel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/perfil/texto");
  await page.evaluate(() =>
    localStorage.setItem(
      "marcou:a11y:v1",
      JSON.stringify({ widgetPosition: "bottom-right", pageScale: 150 }),
    ),
  );
  await page.reload();
  const trigger = page.getByRole("button", {
    name: "Menu de ferramentas de acessibilidade",
  });
  await expect(trigger).toBeInViewport();
  const button = await trigger.boundingBox();
  const navigation = await page.locator(".sidebar").boundingBox();
  expect(button!.y + button!.height).toBeLessThanOrEqual(navigation!.y);
  await trigger.click();
  await expect(page.locator("#a11y-panel")).toBeInViewport();
  await expect(page.locator("#a11y-panel")).toHaveCSS("zoom", "1");
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    localStorage.setItem(
      "marcou:a11y:v1",
      JSON.stringify({ widgetPosition: "bottom-left", pageScale: 100 }),
    ),
  );
  await page.reload();
  const left = await trigger.boundingBox();
  expect(left!.y + left!.height).toBeLessThanOrEqual(navigation!.y);
});
