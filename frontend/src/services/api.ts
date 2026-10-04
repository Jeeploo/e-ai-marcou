import { professionals } from "../data/catalog";
import type { Appointment, Slot } from "../types/models";
export const demoMode =
  import.meta.env.MODE !== "api" && import.meta.env.VITE_DATA_MODE !== "api";
export const patientId = import.meta.env.VITE_PATIENT_ID || "paciente-demo";
const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const friendlyError = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : "Não foi possível concluir. Verifique sua conexão e tente novamente.";
export function day(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value + "T12:00:00"));
}
export function isPast(data: string, hora: string) {
  return new Date(`${data}T${hora}:00`).getTime() < Date.now();
}
const key = "marcou:appointments:v1";
function readDemo(): Appointment[] {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const data: unknown = JSON.parse(raw);
      if (
        Array.isArray(data) &&
        data.every(
          (a) =>
            a &&
            typeof a.id === "string" &&
            typeof a.data === "string" &&
            typeof a.hora === "string" &&
            typeof a.profissionalId === "string",
        )
      )
        return data as Appointment[];
    } catch {
      /* Recover malformed demo data. */
    }
  }
  return [
    {
      id: "consulta-inicial",
      pacienteId: patientId,
      profissionalId: "mario",
      horarioId: `mario_${day(1)}_14:00`,
      data: day(1),
      hora: "14:00",
      valor: 200,
      status: "agendado",
    },
    {
      id: "historico-1",
      pacienteId: patientId,
      profissionalId: "ana",
      horarioId: "anterior",
      data: day(-8),
      hora: "09:00",
      valor: 180,
      status: "concluido",
    },
    {
      id: "historico-2",
      pacienteId: patientId,
      profissionalId: "carlos",
      horarioId: "cancelado",
      data: day(-15),
      hora: "10:30",
      valor: 190,
      status: "cancelado",
    },
  ];
}
function saveDemo(data: Appointment[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw new ApiError(
      507,
      "Não foi possível salvar neste navegador. Libere espaço ou permita o armazenamento local.",
    );
  }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!navigator.onLine)
    throw new ApiError(
      0,
      "Você está sem internet. Conecte-se para concluir esta ação.",
    );
  const response = await fetch(base + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new ApiError(
      response.status,
      response.status === 409
        ? "Esse horário acabou de ser ocupado. Escolha outro horário."
        : response.status === 404
          ? "Informação não encontrada. Atualize a página e tente novamente."
          : "Não foi possível concluir a solicitação. Tente novamente.",
    );
  return response.status === 204 ? (undefined as T) : response.json();
}
function online() {
  if (!navigator.onLine)
    throw new ApiError(
      0,
      "Você está sem internet. Conecte-se para agendar, remarcar ou cancelar.",
    );
}
function parseSlot(id: string): Slot {
  const [profissionalId, data, hora] = id.split("_");
  if (
    !professionals.some((p) => p.id === profissionalId) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    ![
      "08:30",
      "09:00",
      "10:30",
      "11:00",
      "14:00",
      "14:30",
      "15:30",
      "17:00",
      "17:30",
    ].includes(hora) ||
    isPast(data, hora)
  )
    throw new ApiError(400, "Escolha um horário disponível.");
  return { id, profissionalId, data, hora, disponivel: true };
}
function ensureFree(slot: Slot, appointments: Appointment[]) {
  if (
    slot.hora === "11:00" ||
    appointments.some((a) => a.horarioId === slot.id && a.status === "agendado")
  )
    throw new ApiError(
      409,
      "Esse horário acabou de ser ocupado. Escolha outro horário.",
    );
}
export const bookingService = {
  async list(): Promise<Appointment[]> {
    if (!demoMode)
      return request(
        `/api/agendamentos?pacienteId=${encodeURIComponent(patientId)}`,
      );
    return readDemo();
  },
  async slots(profissionalId: string, data: string): Promise<Slot[]> {
    if (!demoMode)
      return request(
        `/api/horarios?profissionalId=${encodeURIComponent(profissionalId)}&data=${data}`,
      );
    const appointments = readDemo();
    return [
      "08:30",
      "09:00",
      "10:30",
      "11:00",
      "14:00",
      "14:30",
      "15:30",
      "17:00",
      "17:30",
    ].map((hora) => {
      const id = `${profissionalId}_${data}_${hora}`;
      return {
        id,
        profissionalId,
        data,
        hora,
        disponivel:
          hora !== "11:00" &&
          !isPast(data, hora) &&
          !appointments.some(
            (a) => a.horarioId === id && a.status === "agendado",
          ),
      };
    });
  },
  async create(horarioId: string): Promise<Appointment | undefined> {
    online();
    if (!demoMode)
      return request("/api/agendamentos", {
        method: "POST",
        body: JSON.stringify({ pacienteId: patientId, horarioId }),
      });
    const slot = parseSlot(horarioId),
      items = readDemo();
    ensureFree(slot, items);
    const item: Appointment = {
      id: crypto.randomUUID(),
      pacienteId: patientId,
      profissionalId: slot.profissionalId,
      horarioId,
      data: slot.data,
      hora: slot.hora,
      valor: professionals.find((p) => p.id === slot.profissionalId)!.price,
      status: "agendado",
    };
    saveDemo([...items, item]);
    return item;
  },
  async reschedule(id: string, novoHorarioId: string): Promise<void> {
    online();
    if (!demoMode)
      return request(`/api/agendamentos/${encodeURIComponent(id)}/reagendar`, {
        method: "PATCH",
        body: JSON.stringify({ novoHorarioId }),
      });
    const items = readDemo(),
      current = items.find((a) => a.id === id);
    if (
      !current ||
      current.status !== "agendado" ||
      isPast(current.data, current.hora)
    )
      throw new ApiError(400, "Esta consulta não pode ser remarcada.");
    const slot = parseSlot(novoHorarioId);
    if (slot.profissionalId !== current.profissionalId)
      throw new ApiError(400, "Escolha um horário do mesmo profissional.");
    ensureFree(slot, items);
    saveDemo(
      items.map((a) =>
        a.id === id
          ? { ...a, horarioId: slot.id, data: slot.data, hora: slot.hora }
          : a,
      ),
    );
  },
  async cancel(id: string): Promise<void> {
    online();
    if (!demoMode)
      return request(`/api/agendamentos/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    const items = readDemo(),
      current = items.find((a) => a.id === id);
    if (
      !current ||
      current.status !== "agendado" ||
      isPast(current.data, current.hora)
    )
      throw new ApiError(400, "Esta consulta não pode ser cancelada.");
    saveDemo(
      items.map((a) => (a.id === id ? { ...a, status: "cancelado" } : a)),
    );
  },
};
export const catalogApi = {
  professionals: () => request<unknown[]>("/api/profissionais"),
  specialties: () =>
    request<{ id: string; nome: string }[]>("/api/especialidades"),
  clinics: () =>
    request<
      {
        id: string;
        nome: string;
        endereco: string;
        cidade: string;
        uf: string;
        latitude?: number;
        longitude?: number;
      }[]
    >("/api/clinicas"),
};
