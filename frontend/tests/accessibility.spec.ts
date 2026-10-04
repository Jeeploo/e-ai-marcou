import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [375, 1440]) {
  test(`acessibilidade WCAG em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/busca",
      "/agenda",
      "/profissional/ana",
      "/perfil/dados",
      "/perfil/notificacoes",
      "/perfil/enderecos",
    ]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        path,
      ).toEqual([]);
    }
  });
}

test("modais, confirmação e teclado acessíveis", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  await page.goto("/agenda");
  const cancel = page.getByRole("button", {
    name: "Cancelar consulta",
    exact: true,
  });
  await cancel.click();
  await audit();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(cancel).toBeFocused();
  await page.goto("/perfil/enderecos");
  await page.getByRole("button", { name: "Adicionar endereço" }).click();
  await audit();
  await page.keyboard.press("Escape");
  await page.goto("/profissional/ana");
  await page.getByRole("button", { name: "09:00", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await audit();
  await page
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await audit();
});
