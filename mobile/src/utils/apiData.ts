import type { ScheduleDto } from '../models/BookingModel';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isScheduleDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
}

export function isScheduleTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function isScheduleDto(value: unknown): value is ScheduleDto {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.profissionalId === 'string'
    && typeof value.clinicaId === 'string'
    && isScheduleDate(value.data)
    && isScheduleTime(value.hora)
    && typeof value.disponivel === 'boolean';
}
