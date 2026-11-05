import { test as base, expect, type BrowserContext } from "@playwright/test";
import type { Appointment } from "../../src/types/models";

// HTTP fixtures deliberately independent of the old frontend/src/data catalog.
const specialties = [
  "Cardiologia",
  "Ortopedia",
  "Neurologia",
  "Dermatologia",
  "Clínica Geral",
];
const people = [
  ["ana", "Dra. Ana Lima", 0, 180],
  ["mario", "Dr. Mário Souza", 0, 190],
  ["julia", "Dra. Júlia Santos", 1, 150],
  ["maria", "Dra. Maria Costa", 2, 160],
  ["paulo", "Dr. Paulo Alves", 3, 170],
  ["clara", "Dra. Clara Silva", 4, 140],
] as const;
export function futureDate(offset = 1) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export async function mockAppApi(context: BrowserContext) {
  const date = futureDate(2);
  const api = {
    appointments: [
      {
        id: "consulta",
        pacienteId: "paciente-demo",
        profissionalId: "julia",
        horarioId: `julia_${date}_14:00`,
        data: date,
        hora: "14:00",
        valor: 150,
        status: "agendado",
      },
    ] as Appointment[],
    writes: [] as {
      method: string;
      path: string;
      body: unknown;
      status: number;
    }[],
  };
  let nextId = 1;
  await context.route("https://www.google.com/maps**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="pt-BR"><title>Mapa de teste</title><body>Mapa externo simulado</body></html>',
    }),
  );
  await context.route("**/api/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      method = request.method(),
      path = url.pathname;
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204 });
      return;
    }
    if (method === "GET") {
      let json: unknown;
      if (path === "/api/especialidades")
        json = specialties.map((nome, i) => ({ id: `s${i}`, nome }));
      else if (path === "/api/clinicas")
        json = people.map(([id], i) => ({
          id: `c-${id}`,
          nome: `Clínica ${id}`,
          endereco: `Rua ${id}, ${i + 1}`,
          cidade: "Recife",
          uf: "PE",
          latitude: -8.05 + i * 0.01,
          longitude: -34.9,
        }));
      else if (path === "/api/profissionais/busca") {
        const specialty = url.searchParams.get("especialidadeId");
        const query = (url.searchParams.get("q") || "").toLocaleLowerCase(
          "pt-BR",
        );
        const max = url.searchParams.get("valorMaximo");
        json = people
          .filter(
            ([id, nome, index, price]) =>
              (!specialty || specialty === `s${index}`) &&
              (!max || price <= Number(max)) &&
              `${nome} Clínica ${id} ${specialties[index]}`
                .toLocaleLowerCase("pt-BR")
                .includes(query),
          )
          .map(([id, nome, index, valorConsulta]) => ({
            id,
            nome,
            especialidade: specialties[index],
            valorConsulta,
            clinica: {
              nome: `Clínica ${id}`,
              endereco: `Rua ${id}`,
              cidade: "Recife",
              uf: "PE",
            },
            distanciaKm: null,
            proximoHorario: {
              id: `${id}_${date}_09:00`,
              data: date,
              hora: "09:00",
            },
          }))
          .sort((a, b) => a.valorConsulta - b.valorConsulta);
      } else if (path === "/api/profissionais")
        json = people.map(([id, nome, specialty, valorConsulta]) => ({
          id,
          nome,
          especialidadeId: `s${specialty}`,
          clinicaId: `c-${id}`,
          valorConsulta,
          crm: "CRM-PE 123",
          ativo: true,
        }));
      else if (path === "/api/agendamentos") json = api.appointments;
      else if (path === "/api/horarios") {
        const id = url.searchParams.get("profissionalId"),
          data = url.searchParams.get("data");
        json = ["09:00", "10:30", "11:00"].map((hora) => ({
          id: `${id}_${data}_${hora}`,
          profissionalId: id,
          data,
          hora,
          disponivel:
            hora !== "11:00" &&
            !api.appointments.some(
              (a) =>
                a.horarioId === `${id}_${data}_${hora}` &&
                a.status === "agendado",
            ),
        }));
      } else {
        await route.fulfill({
          status: 501,
          json: { detail: `Unmocked GET ${path}` },
        });
        return;
      }
      await route.fulfill({ json });
      return;
    }
    const body = method === "DELETE" ? undefined : request.postDataJSON();
    const slotId = method === "POST" ? body.horarioId : body?.novoHorarioId;
    const [profissionalId, data, hora] = (slotId || "").split("_");
    const target = api.appointments.find(
      (a) =>
        path === `/api/agendamentos/${a.id}` ||
        path === `/api/agendamentos/${a.id}/reagendar`,
    );
    let status = 204;
    if (
      slotId &&
      api.appointments.some(
        (a) => a.horarioId === slotId && a.status === "agendado",
      )
    )
      status = 409;
    else if (method === "POST" && path === "/api/agendamentos") {
      status = 201;
      const valor = people.find((p) => p[0] === profissionalId)?.[3] || 180;
      const created: Appointment = {
        id: `nova-${nextId++}`,
        pacienteId: body.pacienteId,
        profissionalId,
        horarioId: slotId,
        data,
        hora,
        valor,
        status: "agendado",
      };
      api.appointments.push(created);
    } else if (method === "PATCH" && target)
      Object.assign(target, { profissionalId, horarioId: slotId, data, hora });
    else if (method === "DELETE" && target) target.status = "cancelado";
    else status = 501;
    api.writes.push({ method, path, body, status });
    await route.fulfill(
      status === 204
        ? { status }
        : {
            status,
            json:
              status === 201
                ? api.appointments.at(-1)
                : { detail: status === 409 ? "occupied" : "Unmocked mutation" },
          },
    );
  });
  return api;
}
export const test = base.extend<{
  api: Awaited<ReturnType<typeof mockAppApi>>;
}>({
  api: [
    async ({ context }, use) => {
      await use(await mockAppApi(context));
    },
    { auto: true },
  ],
});
export { expect };
