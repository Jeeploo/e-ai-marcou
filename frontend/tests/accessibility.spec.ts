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
