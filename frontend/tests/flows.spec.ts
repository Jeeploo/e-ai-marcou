import { test, expect } from "@playwright/test";
test("busca preserva filtros e mostra estado vazio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Cardiologia 2 clínicas" }).click();
  await expect(page.locator(".doctor-card")).toHaveCount(2);
  await page.getByRole("link", { name: "Ver horários" }).first().click();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page).toHaveURL(/especialidade=Cardiologia/);
  await page
    .getByRole("textbox", { name: "Pesquisar", exact: true })
    .fill("inexistente");
  await expect(page.getByText("Nenhum resultado encontrado")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.locator(".doctor-card")).toHaveCount(6);
});
test("agenda cria, persiste, remarca e mantém cancelamento no histórico", async ({
  page,
}) => {
  await page.goto("/profissional/ana");
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "11:00 indisponível" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "Ver minhas consultas" }).click();
  let card = page.locator(".appointment").filter({ hasText: "Dra. Ana Lima" });
  await expect(card).toContainText("09:00");
  await page.reload();
  card = page.locator(".appointment").filter({ hasText: "Dra. Ana Lima" });
  await card.getByRole("link", { name: "Remarcar" }).click();
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar remarcação", exact: true })
    .click();
  await page.getByRole("link", { name: "Ver minhas consultas" }).click();
  card = page.locator(".appointment").filter({ hasText: "Dra. Ana Lima" });
  await expect(card).toContainText("10:30");
  await card.getByRole("button", { name: "Cancelar consulta" }).click();
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await expect(
    page.getByText("Consulta cancelada. Ela continua disponível no histórico."),
  ).toBeVisible();
  await page.getByRole("button", { name: /Histórico/ }).click();
  await expect(
    page
      .locator(".appointment")
      .filter({ hasText: "Dra. Ana Lima" })
      .filter({ hasText: "Cancelada" }),
  ).toHaveCount(1);
});
test("conflito entre abas não cria uma segunda consulta", async ({
  page,
  context,
}) => {
  await page.goto("/profissional/ana");
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await expect(
    page.getByRole("button", { name: "Confirmar agendamento", exact: true }),
  ).toBeEnabled();
  const other = await context.newPage();
  await other.goto(page.url());
  await expect(
    other.getByRole("button", { name: "Confirmar agendamento", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await other
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await expect(other.getByRole("alert")).toContainText("ocupado");
});
test("perfil salva dados, endereço e preferências; modal aceita Escape", async ({
  page,
}) => {
  await page.goto("/perfil/dados");
  await page
    .getByRole("textbox", { name: "Nome completo" })
    .fill("Pessoa Teste");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await page.getByRole("link", { name: "Endereços", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar endereço" }).click();
  await page
    .getByRole("textbox", { name: "CEP", exact: true })
    .fill("12345678");
  await page
    .getByRole("textbox", { name: "Rua / Avenida" })
    .fill("Rua de Teste");
  await page.getByRole("textbox", { name: "Número", exact: true }).fill("10");
  await page
    .getByRole("textbox", { name: "Bairro", exact: true })
    .fill("Centro");
  await page
    .getByRole("textbox", { name: "Cidade", exact: true })
    .fill("São Paulo");
  await page.getByRole("textbox", { name: "Estado (UF)" }).fill("SP");
  await page.getByRole("button", { name: "Salvar endereço" }).click();
  await expect(page.getByText("Rua de Teste, 10")).toBeVisible();
  await page.getByRole("button", { name: "Adicionar endereço" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Notificações", exact: true }),
  ).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".sidebar-user")).toContainText("Pessoa Teste");
});
test("PWA registra cache e abre offline, bloqueando agendamento", async ({
  page,
  context,
}) => {
  await page.goto("/profissional/ana");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText(
      "Você está sem internet. Agendar, remarcar e cancelar exigem conexão.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Avançar para agendamento" }),
  ).toBeDisabled();
  await context.setOffline(false);
  await expect(
    page.getByRole("button", { name: "Avançar para agendamento" }),
  ).toBeEnabled();
  const manifest = await page.request.get("/manifest.webmanifest");
  expect((await manifest.json()).display).toBe("standalone");
});
for (const width of [320, 375, 430, 768, 1024, 1440])
  test(`layouts sem overflow horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/busca",
      "/profissional/ana",
      "/agenda",
      "/perfil/dados",
      "/perfil/notificacoes",
      "/busca?visualizacao=mapa",
    ]) {
      await page.goto(route);
      await page.waitForTimeout(150);
      if (route === "/") {
        const cards = page.locator(".specialties a");
        await expect(cards.first()).toBeVisible();
        const layout = await cards.evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            const title = element.querySelector("h3")!;
            const range = document.createRange();
            range.selectNodeContents(title);
            return {
              left: rect.left,
              right: rect.right,
              titleLines: range.getClientRects().length,
            };
          }),
        );
        for (const card of layout) {
          expect(card.left).toBeGreaterThanOrEqual(0);
          expect(card.right).toBeLessThanOrEqual(width);
          expect(card.titleLines).toBe(1);
        }
        await expect(page.locator(".specialties")).toHaveCSS(
          "grid-template-columns",
          new RegExp(
            `^(\\S+\\s+){${width <= 540 ? 0 : width <= 1150 ? 1 : 2}}\\S+$`,
          ),
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        route,
      ).toBeTruthy();
    }
  });
for (const width of [375, 1440])
  test(`voltar visível nas telas secundárias em ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/busca", "/agenda", "/perfil"]) {
      await page.goto(route);
      await expect(
        page.getByRole("button", { name: "Voltar", exact: true }),
      ).toHaveCount(0);
    }
    for (const route of [
      "/profissional/ana",
      "/profissional/ana?remarcar=consulta",
      "/confirmar?profissional=ana",
      "/confirmar?profissional=ana&remarcar=consulta",
      "/perfil/dados",
      "/perfil/enderecos",
      "/perfil/notificacoes",
      "/perfil/texto",
    ]) {
      await page.goto(route);
      const back = page.getByRole("button", { name: "Voltar", exact: true });
      await expect(back).toBeVisible();
      await expect(back).toBeInViewport();
      const rect = await back.boundingBox();
      expect(rect!.width).toBeGreaterThanOrEqual(44);
      expect(rect!.height).toBeGreaterThanOrEqual(44);
      await expect(back.locator("svg")).toHaveClass(/lucide-arrow-left/);
      await expect(back).toHaveCSS("color", "rgb(18, 59, 58)");
      await expect(back).toHaveCSS("background-color", "rgb(255, 255, 255)");
    }
    await page.goto("/agenda");
    await page.getByRole("button", { name: "Ver detalhes" }).first().click();
    const back = page
      .getByRole("dialog")
      .getByRole("button", { name: "Voltar", exact: true });
    await expect(back).toBeVisible();
    await expect(back).toBeInViewport();
    await back.click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
test("texto grande não gera overflow em celular", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/perfil/texto");
  await page.getByRole("button", { name: "Grande", exact: true }).click();
  for (const route of ["/", "/agenda", "/profissional/ana", "/perfil/dados"]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBeTruthy();
  }
});

test("referências do Figma e textos revisados", async ({ page }) => {
  await page.goto("/busca?visualizacao=mapa");
  await expect(page.locator(".region-map")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Consultar endereço no mapa" }),
  ).toBeVisible();
  for (const route of [
    "/",
    "/perfil/dados",
    "/perfil/notificacoes",
    "/profissional/ana",
  ]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText(
      /demonstração|demonstrativo|dados fictícios/i,
    );
  }
  await page.goto("/perfil/notificacoes");
  await expect(
    page.getByRole("switch", { name: "WhatsApp", exact: true }),
  ).toBeVisible();
});
