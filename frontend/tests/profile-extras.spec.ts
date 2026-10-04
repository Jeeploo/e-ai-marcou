import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("endereço: validação, edição, desistência e exclusão", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/perfil/enderecos");
  await page.getByRole("button", { name: "Adicionar endereço" }).click();
  await page
    .getByRole("textbox", { name: "CEP", exact: true })
    .fill("01001000");
  await page.getByRole("textbox", { name: "Rua / Avenida" }).fill("   ");
  await page.getByRole("textbox", { name: "Número", exact: true }).fill("10");
  await page
    .getByRole("textbox", { name: "Bairro", exact: true })
    .fill("Centro");
  await page
    .getByRole("textbox", { name: "Cidade", exact: true })
    .fill("São Paulo");
  await page.getByRole("textbox", { name: "Estado (UF)" }).fill("ZZ");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await expect(page.getByRole("alert")).toContainText("Preencha rua");
  await page.getByRole("textbox", { name: "Rua / Avenida" }).fill("Rua Teste");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await expect(page.getByRole("alert")).toContainText("sigla de estado válida");
  await page.getByRole("textbox", { name: "Estado (UF)" }).fill("SP");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await page.getByRole("button", { name: "Editar endereço" }).click();
  await page.getByRole("textbox", { name: "Número", exact: true }).fill("20");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await expect(page.locator(".address-card")).toContainText("Rua Teste, 20");
  await page
    .getByRole("button", { name: "Excluir endereço", exact: true })
    .click();
  await page.getByRole("button", { name: "Manter endereço" }).click();
  await expect(page.locator(".address-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Excluir endereço", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();
  await expect(page.locator(".address-card")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".address-card")).toHaveCount(0);
});
