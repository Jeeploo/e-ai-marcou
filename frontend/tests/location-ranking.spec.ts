import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [320, 375, 1280]) {
  test(`referência, navegação e reserva em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/busca");
    const fields = page.locator(
      ".search-page input, .search-page select, .search-page .location-controls > button",
    );
    const boxes = await fields.evaluateAll((elements) =>
      elements.map((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }),
    );
    for (const box of boxes) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    if (width === 1280) {
      expect(boxes[0].y).toBe(boxes[1].y);
      expect(boxes[1].y).toBe(boxes[2].y);
      expect(boxes[3].y).toBe(boxes[4].y);
      expect(boxes[4].y).toBe(boxes[5].y);
      expect(boxes[5].y).toBe(boxes[6].y);
      expect(boxes[6].width).toBeLessThan(width / 3);
    } else {
      for (let i = 1; i < boxes.length; i++) {
        expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y);
      }
    }
    await expect(page.locator(".doctor-card").first()).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({ path: `/tmp/busca-${width}.png`, fullPage: true });
    await page.getByLabel("Buscar perto de").selectOption("casa");
    await expect(page.locator(".doctor-card").first()).toContainText("km");
    await page.getByLabel("Buscar perto de").selectOption("mainha");
    await page
      .getByLabel("Para quem é esta consulta?")
      .selectOption("outra_pessoa");
    await page
      .locator(".doctor-card")
      .first()
      .getByRole("link", { name: "Ver horários" })
      .click();
    await page.goto("/busca");
    await expect(page.getByLabel("Buscar perto de")).toHaveValue("mainha");
    // Saved reference survives a reload; device coordinates remain in memory.
    await page.getByLabel("Buscar perto de").selectOption("mainha");
    await page.getByRole("link", { name: "Início", exact: true }).click();
    await expect(page.getByLabel("Buscar perto de")).toHaveValue("mainha");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  });
}
test("GPS permitido e negado preserva referência", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: -8.04, longitude: -34.89 });
  await page.goto("/busca");
  await page.getByLabel("Buscar perto de").selectOption("casa");
  await page
    .getByRole("button", { name: "Usar minha localização atual" })
    .click();
  await expect(page.getByLabel("Buscar perto de")).toHaveValue("device");
  const precision = page.getByText("Localização obtida · ver precisão");
  await expect(precision).toBeVisible();
  await precision.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details")).toHaveAttribute("open", "");
  await expect(page.locator("details p")).toContainText("Precisão aproximada");

  await page.getByLabel("Buscar perto de").selectOption("mainha");
  await page.evaluate(() => {
    navigator.geolocation.getCurrentPosition = (_ok, fail) =>
      fail?.({ code: 1 } as GeolocationPositionError);
  });
  await page
    .getByRole("button", { name: "Usar minha localização atual" })
    .click();
  await expect(page.getByText(/Permissão de localização negada/)).toBeVisible();
  await expect(page.getByLabel("Buscar perto de")).toHaveValue("mainha");
});
