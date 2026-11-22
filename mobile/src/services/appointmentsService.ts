import { normalizeAppointment } from '../controllers/appointmentController';
import type { AppointmentCatalog, AppointmentDto } from '../models/AppointmentModel';
import { invalidResponse, requestJson } from './api';

const path = '/api/agendamentos';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAppointmentDto(value: unknown): value is AppointmentDto {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.pacienteId === 'string'
    && typeof value.profissionalId === 'string'
    && typeof value.clinicaId === 'string'
    && typeof value.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.data)
    && Number.isFinite(Date.parse(`${value.data}T00:00:00Z`))
    && typeof value.hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.hora)
    && typeof value.valor === 'number' && Number.isFinite(value.valor) && value.valor >= 0
    && (value.status === 'agendado' || value.status === 'cancelado');
}

function isCatalogEntry(value: unknown): value is { id: string; nome: string } {
  return isRecord(value) && typeof value.id === 'string' && typeof value.nome === 'string';
}

function isProfessional(value: unknown): value is AppointmentCatalog['professionals'][number] {
  return isCatalogEntry(value) && 'especialidadeId' in value && typeof value.especialidadeId === 'string';
}

async function getCatalogEntries<T>(path: string, isEntry: (value: unknown) => value is T) {
  try {
    const data = await requestJson(path);
    return Array.isArray(data) ? data.filter(isEntry) : [];
  } catch {
    return [];
  }
}

async function getCatalog(): Promise<AppointmentCatalog> {
  const [professionals, clinics, specialties] = await Promise.all([
    getCatalogEntries('/api/profissionais', isProfessional),
    getCatalogEntries('/api/clinicas', isCatalogEntry),
    getCatalogEntries('/api/especialidades', isCatalogEntry),
  ]);
  return { professionals, clinics, specialties };
}

export async function getAppointments(patientId: string) {
  const data = await requestJson(`${path}?pacienteId=${encodeURIComponent(patientId)}`);
  if (!Array.isArray(data) || !data.every(isAppointmentDto)) throw invalidResponse();
  const appointments = data.filter(({ pacienteId }) => pacienteId === patientId);
  if (!appointments.length) return [];
  const catalog = await getCatalog();
  return appointments.map((appointment) => normalizeAppointment(appointment, catalog));
}

export async function getAppointment(id: string, patientId: string) {
  const data = await requestJson(`${path}/${encodeURIComponent(id)}`);
  if (!isAppointmentDto(data)) throw invalidResponse();
  if (data.id !== id || data.pacienteId !== patientId) return null;
  return normalizeAppointment(data, await getCatalog());
}

export async function cancelAppointment(id: string, patientId: string) {
  const data = await requestJson(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!isAppointmentDto(data) || data.id !== id || data.pacienteId !== patientId || data.status !== 'cancelado') {
    throw invalidResponse();
  }
  return normalizeAppointment(data);
}
