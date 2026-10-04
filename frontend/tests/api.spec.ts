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
