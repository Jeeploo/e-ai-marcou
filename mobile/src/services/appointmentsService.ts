import { isPrice, isRecord, isScheduleDate, isScheduleTime } from '../utils/apiData';
import { normalizeAppointment } from '../controllers/appointmentController';
import type { AppointmentCatalog, AppointmentDto } from '../models/AppointmentModel';
import { invalidResponse, requestJson } from './api';

const path = '/api/agendamentos';

export function isAppointmentDto(value: unknown): value is AppointmentDto {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.pacienteId === 'string'
    && typeof value.profissionalId === 'string'
    && typeof value.clinicaId === 'string'
    && typeof value.horarioId === 'string'
    && isScheduleDate(value.data)
    && isScheduleTime(value.hora)
    && isPrice(value.valor)
    && (value.status === 'agendado' || value.status === 'cancelado');
}

function isCatalogEntry(value: unknown): value is { id: string; nome: string } {
  return isRecord(value) && typeof value.id === 'string' && typeof value.nome === 'string';
}

function isProfessional(value: unknown): value is AppointmentCatalog['professionals'][number] {
  if (!isRecord(value)) return false;
  const { especialidadeId, fotoUrl } = value;
  return isCatalogEntry(value) && typeof especialidadeId === 'string'
    && (fotoUrl == null || typeof fotoUrl === 'string');
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
