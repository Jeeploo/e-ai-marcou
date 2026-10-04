import { test, expect } from "@playwright/test";
test("contrato HTTP: criar, 409, reagendar e cancelar preservando histórico", async ({
  page,
}) => {
  let items: any[] = [];
  let conflict = true;
  const writes: { method: string; body: any }[] = [];
  await page.route("http://127.0.0.1:8000/api/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname,
      method = req.method();
    let json: any = [];
    if (path.endsWith("/especialidades"))
      json = [{ id: "cardio", nome: "Cardiologia" }];
    else if (path.endsWith("/clinicas"))
      json = [
        {
          id: "clinica",
          nome: "Clínica de teste",
          endereco: "Praça da Sé, 1",
          cidade: "São Paulo",
          uf: "SP",
        },
      ];
    else if (path.endsWith("/profissionais"))
      json = [
        {
          id: "ana",
          nome: "Dra. Ana Lima",
          crm: "CRM-SP 123",
          especialidadeId: "cardio",
          clinicaId: "clinica",
          valorConsulta: 180,
          ativo: true,
        },
      ];
    else if (path.endsWith("/horarios")) {
      expect(url.searchParams.get("profissionalId")).toBe("ana");
      const data = url.searchParams.get("data");
      json = ["09:00", "10:30"].map((hora) => ({
        id: `ana_${data}_${hora}`,
        profissionalId: "ana",
        data,
        hora,
        disponivel: !items.some(
          (a) =>
            a.status === "agendado" && a.horarioId === `ana_${data}_${hora}`,
        ),
      }));
    } else if (method === "POST") {
      const body = req.postDataJSON();
      writes.push({ method, body });
      expect(Object.keys(body).sort()).toEqual(["horarioId", "pacienteId"]);
      expect(body.pacienteId).toBe("paciente-teste");
      if (conflict) {
        conflict = false;
        await route.fulfill({ status: 409, json: { detail: "occupied" } });
        return;
      }
      const [, data, hora] = body.horarioId.split("_");
      json = {
        id: "consulta",
        ...body,
        profissionalId: "ana",
        data,
        hora,
        valor: 180,
        status: "agendado",
      };
      items = [json];
    } else if (method === "PATCH") {
      expect(path).toBe("/api/agendamentos/consulta/reagendar");
      const body = req.postDataJSON();
      writes.push({ method, body });
      expect(Object.keys(body)).toEqual(["novoHorarioId"]);
      const [, data, hora] = body.novoHorarioId.split("_");
      items = items.map((a) => ({
        ...a,
        horarioId: body.novoHorarioId,
        data,
        hora,
      }));
      json = items[0];
    } else if (method === "DELETE") {
      expect(path).toBe("/api/agendamentos/consulta");
      writes.push({ method, body: req.postData() });
      items = items.map((a) => ({ ...a, status: "cancelado" }));
      json = items[0];
    } else if (path.endsWith("/agendamentos")) {
      expect(url.searchParams.get("pacienteId")).toBe("paciente-teste");
      json = items;
    }
    await route.fulfill({ json });
  });
  await page.goto("/profissional/ana");
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("ocupado");
  await page.getByRole("link", { name: "Escolher outro horário" }).click();
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await page.getByRole("link", { name: "Ver minhas consultas" }).click();
  await page.getByRole("link", { name: "Remarcar" }).click();
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar remarcação", exact: true })
    .click();
  await page.getByRole("link", { name: "Ver minhas consultas" }).click();
  await expect(page.locator(".appointment")).toContainText("10:30");
  await page.getByRole("button", { name: "Cancelar consulta" }).click();
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await page.getByRole("button", { name: /Histórico/ }).click();
  await expect(page.locator(".appointment")).toContainText("Cancelada");
  expect(writes.map((w) => w.method)).toEqual([
    "POST",
    "POST",
    "PATCH",
    "DELETE",
  ]);
});

// Remaining frontend states are exercised without a running backend.
async function fixture(
  page: import("@playwright/test").Page,
  options: { empty?: boolean; error?: boolean; delay?: Promise<void> } = {},
) {
  await page.route("http://127.0.0.1:8000/api/**", async (route) => {
    const u = new URL(route.request().url());
    if (u.pathname.endsWith("profissionais")) {
      if (options.delay) await options.delay;
      if (options.error)
        return route.fulfill({
          status: 500,
          json: { detail: "INTERNAL_STACK_TRACE" },
        });
      return route.fulfill({
        json: [
          {
            id: "ana",
            nome: "Dra. Ana Lima",
            crm: "CRM-SP 123",
            especialidadeId: "e",
            clinicaId: "c",
            valorConsulta: 180,
          },
        ],
      });
    }
    if (u.pathname.endsWith("especialidades"))
      return route.fulfill({ json: [{ id: "e", nome: "Cardiologia" }] });
    if (u.pathname.endsWith("clinicas"))
      return route.fulfill({
        json: [
          {
            id: "c",
            nome: "Clínica Teste",
            endereco: "Rua Teste, 10",
            cidade: "São Paulo",
            uf: "SP",
          },
        ],
      });
    if (u.pathname.endsWith("horarios"))
      return route.fulfill({
        json: options.empty
          ? []
          : [
              {
                id: "s1",
                profissionalId: "ana",
                data: u.searchParams.get("data"),
                hora: "09:00",
                disponivel: true,
              },
            ],
      });
    return route.fulfill({ json: [] });
  });
}
const confirmation = "/confirmar?profissional=ana&horario=s1&data=2030-10-05";
test("link de confirmação aguarda catálogo; data inválida não quebra a tela", async ({
  page,
}) => {
  let release!: () => void;
  await fixture(page, { delay: new Promise<void>((r) => (release = r)) });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(confirmation);
  await expect(page.getByRole("status")).toContainText("Carregando resumo");
  release();
  await expect(
    page.getByRole("button", { name: "Confirmar agendamento", exact: true }),
  ).toBeEnabled();
  await page.goto(confirmation.replace("2030-10-05", "2030-99-99"));
  await expect(page.getByRole("alert")).toContainText("Escolha uma data");
  await expect(
    page.getByRole("button", { name: "Confirmar agendamento", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
test("falha de catálogo é amigável e permite tentar novamente", async ({
  page,
}) => {
  const options = { error: true };
  await fixture(page, options);
  await page.goto("/busca");
  await expect(page.getByRole("alert")).toContainText("Não foi possível");
  await expect(page.locator("body")).not.toContainText("INTERNAL_STACK_TRACE");
  options.error = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".doctor-card")).toHaveCount(1);
});
test("horários vazios mantêm avanço bloqueado", async ({ page }) => {
  await fixture(page, { empty: true });
  await page.goto("/profissional/ana");
  await expect(
    page.getByText("Nenhum horário disponível. Escolha outra data."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Avançar para agendamento" }),
  ).toBeDisabled();
});
test("remarcação 409 descarta horário; offline e envio pendente não reenviam", async ({
  page,
  context,
}) => {
  await fixture(page);
  let writes = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/api/agendamentos/consulta/reagendar", async (r) => {
    writes++;
    await gate;
    await r.fulfill({ status: 409, json: { detail: "occupied" } });
  });
  await page.goto(confirmation + "&remarcar=consulta");
  const button = page.getByRole("button", {
    name: "Confirmar remarcação",
    exact: true,
  });
  await expect(button).toBeEnabled();
  await context.setOffline(true);
  await expect(button).toBeDisabled();
  expect(writes).toBe(0);
  await context.setOffline(false);
  await button.click();
  await expect(
    page.getByRole("button", { name: "Confirmando…" }),
  ).toBeDisabled();
  release();
  await expect(page.getByRole("alert")).toContainText("ocupado");
  await expect(button).toBeDisabled();
  expect(writes).toBe(1);
});
test("cancelamento com erro mantém consulta e permite recuperar", async ({
  page,
}) => {
  await fixture(page);
  let cancelled = false,
    fail = true,
    deletes = 0;
  await page.route("**/api/agendamentos**", async (r) => {
    if (r.request().method() === "DELETE") {
      deletes++;
      if (fail)
        return r.fulfill({
          status: 500,
          json: { detail: "INTERNAL_STACK_TRACE" },
        });
      cancelled = true;
      return r.fulfill({ json: {} });
    }
    return r.fulfill({
      json: [
        {
          id: "consulta",
          pacienteId: "paciente-teste",
          profissionalId: "ana",
          horarioId: "s1",
          data: "2030-10-05",
          hora: "09:00",
          valor: 180,
          status: cancelled ? "cancelado" : "agendado",
        },
      ],
    });
  });
  await page.goto("/agenda");
  await page.getByRole("button", { name: "Ver detalhes" }).click();
  await expect(page.getByRole("dialog")).toContainText("Rua Teste, 10");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Cancelar consulta", exact: true })
    .click();
  await page.getByRole("button", { name: "Manter consulta" }).click();
  expect(deletes).toBe(0);
  await page
    .getByRole("button", { name: "Cancelar consulta", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await expect(page.getByRole("dialog")).toContainText("Não foi possível");
  expect(cancelled).toBe(false);
  fail = false;
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await page.getByRole("button", { name: /Histórico/ }).click();
  await expect(page.locator(".appointment")).toContainText("Cancelada");
});

test("foto da API aparece e retorna às iniciais se falhar; suporte configurável", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/api/profissionais", (r) =>
    r.fulfill({
      json: [
        {
          id: "ana",
          nome: "Dra. Ana Lima",
          crm: "CRM-SP 123",
          especialidadeId: "e",
          clinicaId: "c",
          valorConsulta: 180,
          fotoUrl: "https://images.example.com/ana.png",
        },
      ],
    }),
  );
  await page.route("https://images.example.com/ana.png", (r) =>
    r.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.goto("/busca");
  await expect(page.locator(".doctor-card img")).toBeVisible();
  await page.goto("/profissional/ana");
  await expect(page.locator(".portrait img")).toBeVisible();
  await page.route("https://images.example.com/ana.png", (r) => r.abort());
  await page.reload();
  await expect(page.locator(".portrait")).toHaveText("DA");
  await expect(page.locator(".portrait img")).toHaveCount(0);
  await page.goto("/perfil/ajuda");
  await expect(
    page.getByRole("link", { name: "Falar com o suporte" }),
  ).toHaveAttribute("href", "mailto:suporte@example.com");
});

test("GPS: consentimento, distância, ordenação, rota e remoção", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 0, longitude: 0, accuracy: 20 });
  await page.route("http://127.0.0.1:8000/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = path.endsWith("/profissionais")
      ? [
          {
            id: "longe",
            nome: "Profissional distante",
            clinicaId: "longe",
            valorConsulta: 100,
          },
          {
            id: "perto",
            nome: "Profissional próximo",
            clinicaId: "perto",
            valorConsulta: 200,
          },
          {
            id: "sem",
            nome: "Sem coordenadas",
            clinicaId: "sem",
            valorConsulta: 50,
          },
        ]
      : path.endsWith("/clinicas")
        ? [
            {
              id: "longe",
              nome: "Clínica distante",
              latitude: 0,
              longitude: 1,
              endereco: "Rua A",
              cidade: "Cidade",
              uf: "SP",
            },
            {
              id: "perto",
              nome: "Clínica próxima",
              latitude: 0,
              longitude: 0.01,
              endereco: "Rua B",
              cidade: "Cidade",
              uf: "SP",
            },
            {
              id: "sem",
              nome: "Clínica sem posição",
              latitude: 100,
              longitude: 200,
              endereco: "Rua C",
              cidade: "Cidade",
              uf: "SP",
            },
          ]
        : [];
    await route.fulfill({ json });
  });
  await page.goto("/busca");
  await expect(
    page.getByRole("button", { name: "Mais próximo", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Usar minha localização", exact: true })
    .click();
  await expect(
    page.getByText("1,1 km em linha reta", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("111,2 km em linha reta", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mais próximo", exact: true }).click();
  await expect(page.locator(".doctor-grid .doctor-card h3")).toHaveText([
    "Profissional próximo",
    "Profissional distante",
    "Sem coordenadas",
  ]);
  await page.getByRole("button", { name: "Ver no mapa", exact: true }).click();
  const routeLink = page.getByRole("link", {
    name: "Traçar rota da minha localização",
  });
  await expect(routeLink).toHaveAttribute(
    "href",
    /origin=0,0&destination=0%2C0.01/,
  );
  await page.getByRole("button", { name: "Parar de usar localização" }).click();
  await expect(routeLink).toHaveCount(0);
  await expect(page.getByText(/km em linha reta/)).toHaveCount(0);
});

test("GPS: permissão negada e demora preservam a busca", async ({ page }) => {
  await page.addInitScript(() => {
    let count = 0;
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          _ok: unknown,
          fail: (e: { code: number }) => void,
        ) => fail({ code: ++count === 1 ? 1 : 3 }),
      },
    });
  });
  await page.route("http://127.0.0.1:8000/api/**", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.goto("/busca");
  await page.getByRole("button", { name: "Usar minha localização" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Permissão de localização negada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Usar minha localização" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "demorou para responder" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Pesquisar" })).toBeEnabled();
});
