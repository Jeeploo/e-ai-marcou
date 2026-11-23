import { demoPatient } from '../config/api';
import { isScheduleDto } from '../utils/apiData';
import { invalidResponse, requestJson } from './api';
import { isAppointmentDto } from './appointmentsService';

export async function getSchedules(professionalId: string) {
  const data = await requestJson('/api/horarios?profissionalId=' + encodeURIComponent(professionalId) + '&disponivel=true');
  if (!Array.isArray(data) || !data.every(isScheduleDto)) throw invalidResponse();
  return data;
}

async function saveAppointment(path: string, method: 'POST' | 'PATCH', payload: object, scheduleId: string, appointmentId?: string) {
  const data = await requestJson(path, { method, body: JSON.stringify(payload) });
  if (!isAppointmentDto(data) || data.pacienteId !== demoPatient.id || data.status !== 'agendado'
    || data.horarioId !== scheduleId || (appointmentId && data.id !== appointmentId)) {
    throw invalidResponse();
  }
  return data;
}

export function createBooking(scheduleId: string) {
  return saveAppointment('/api/agendamentos', 'POST', {
    pacienteId: demoPatient.id, horarioId: scheduleId, paraQuem: 'mim',
  }, scheduleId);
}

export function rescheduleBooking(appointmentId: string, scheduleId: string) {
  return saveAppointment('/api/agendamentos/' + encodeURIComponent(appointmentId) + '/reagendar',
    'PATCH', { novoHorarioId: scheduleId }, scheduleId, appointmentId);
}
