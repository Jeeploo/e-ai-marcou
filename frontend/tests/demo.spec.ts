import { test, expect } from "@playwright/test";

test("API demo real: filtrar, agendar, remarcar e cancelar com histórico", async ({
  page,
  request,
}) => {
  await page.goto("/busca?especialidade=Cardiologia");
  await expect(page.locator(".doctor-card")).toHaveCount(2);
  await page.goto("/profissional/demo-profissional-1");
  await page.getByRole("button", { name: "09:30", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar agendamento", exact: true })
    .click();
  await page.getByRole("link", { name: "Ver minhas consultas" }).click();
  await expect(page.locator(".appointment")).toContainText("09:30");
  const read = async () =>
    (
      await request.get(
        "http://127.0.0.1:8001/api/agendamentos?pacienteId=paciente-playwright-demo",
      )
    ).json();
  const [created] = await read();
  const duplicate = await request.post(
    "http://127.0.0.1:8001/api/agendamentos",
    { data: { pacienteId: "outro", horarioId: created.horarioId } },
  );
  expect(duplicate.status()).toBe(409);
  await page.reload();
  await page.getByRole("link", { name: "Remarcar" }).click();
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await page.getByRole("button", { name: "Avançar para agendamento" }).click();
  await page
    .getByRole("button", { name: "Confirmar remarcação", exact: true })
    .click();
  await page.getByRole("link", { name: "Ver minhas consultas" }).click();
  await expect(page.locator(".appointment")).toContainText("10:30");
  const [rescheduled] = await read();
  const slots = async () =>
    (
      await request.get(
        `http://127.0.0.1:8001/api/horarios?profissionalId=${created.profissionalId}&data=${created.data}`,
      )
    ).json();
  expect(
    (await slots()).find((s: any) => s.id === created.horarioId).disponivel,
  ).toBe(true);
  await page.getByRole("button", { name: "Cancelar consulta" }).click();
  await page.getByRole("button", { name: "Confirmar cancelamento" }).click();
  await page.getByRole("button", { name: /Histórico/ }).click();
  await expect(page.locator(".appointment")).toContainText("Cancelada");
  expect((await read())[0].status).toBe("cancelado");
  expect(
    (await slots()).find((s: any) => s.id === rescheduled.horarioId).disponivel,
  ).toBe(true);
});
