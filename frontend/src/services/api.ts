import type { Appointment, Slot } from "../types/models";
export const patientId = import.meta.env.VITE_PATIENT_ID || "paciente-demo";
const base = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "")
).replace(/\/$/, "");
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
export const bookingService = {
  list: () =>
    request<Appointment[]>(
      `/api/agendamentos?pacienteId=${encodeURIComponent(patientId)}`,
    ),
  slots: (profissionalId: string, data: string) =>
    request<Slot[]>(
      `/api/horarios?profissionalId=${encodeURIComponent(profissionalId)}&data=${data}`,
    ),
  create: (horarioId: string) =>
    request<Appointment>("/api/agendamentos", {
      method: "POST",
      body: JSON.stringify({ pacienteId: patientId, horarioId }),
    }),
  reschedule: (id: string, novoHorarioId: string) =>
    request<void>(`/api/agendamentos/${encodeURIComponent(id)}/reagendar`, {
      method: "PATCH",
      body: JSON.stringify({ novoHorarioId }),
    }),
  cancel: (id: string) =>
    request<void>(`/api/agendamentos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
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
