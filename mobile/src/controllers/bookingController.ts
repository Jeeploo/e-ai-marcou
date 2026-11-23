import type { Appointment } from '../models/AppointmentModel';
import type {
  BookingConfirmation,
  BookingRoute,
  RequiredBookingSelection,
  ScheduleSlot,
} from '../models/BookingModel';
import { ApiError, getApiErrorMessage } from '../services/api';
import { createBooking, getSchedules, rescheduleBooking } from '../services/bookingService';
import { getProfessionals } from '../services/professionalsService';
import { findProfessionalById, normalizeProfessional } from './searchController';
import { normalizeAppointment } from './appointmentController';

const rescheduleDemoTimes = ['14:30', '15:30', '16:30'];
const timesByProfessional: Record<string, readonly string[]> = {
  marina: rescheduleDemoTimes,
  carlos: ['09:00', '10:00', '11:00'],
  ana: rescheduleDemoTimes,
  felipe: ['16:00', '17:00', '18:00'],
};

const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const dateLabelFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' });
const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const priceFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 2,
});

function localDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function createDemoSchedules(professionalId: string) {
  const today = new Date();
  const times = timesByProfessional[professionalId] ?? rescheduleDemoTimes;
  return [1, 2, 3].flatMap((offset) => {
    const date = localDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset));
    return times.map((time): ScheduleSlot => ({
      id: 'demo-' + date + '-' + time, professionalId, date, time, available: true,
    }));
  });
}

export function groupSchedules(schedules: readonly ScheduleSlot[], professionalId: string, now = Date.now()) {
  const days = new Map<string, ScheduleSlot[]>();
  const available = schedules
    .filter((slot) => slot.available && slot.professionalId === professionalId
      && Date.parse(slot.date + 'T' + slot.time + ':00-03:00') > now)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
  for (const slot of available) {
    const day = days.get(slot.date);
    if (day) day.push(slot);
    else days.set(slot.date, [slot]);
  }
  return Array.from(days, ([date, slots]) => {
    const day = new Date(date + 'T12:00:00');
    return {
      date, slots, day: day.getDate(),
      weekday: weekdayFormat.format(day).replace(/\.$/, ''),
      month: monthFormat.format(day).replace(/\.$/, ''),
      label: dateLabelFormat.format(day),
    };
  });
}

async function loadProfessional({ professionalId, professional, demo, mode }: BookingRoute) {
  if (professional?.id === professionalId && (demo || mode === 'new')) return professional;
  if (demo) return findProfessionalById(professionalId);
  const dto = (await getProfessionals({ q: '', ordem: 'recomendados' })).find(({ id }) => id === professionalId);
  return dto ? normalizeProfessional(dto) : undefined;
}

export async function loadBookingOptions(route: BookingRoute) {
  const { professionalId, demo } = route;
  const [professional, schedules] = await Promise.all([
    loadProfessional(route),
    demo ? createDemoSchedules(professionalId) : getSchedules(professionalId).then((items) =>
      items.map((slot): ScheduleSlot => ({
        id: slot.id, professionalId: slot.profissionalId, date: slot.data, time: slot.hora, available: slot.disponivel,
      }))),
  ]);
  if (!professional) return null;
  return {
    professional,
    days: groupSchedules(schedules, professionalId),
    priceLabel: priceFormat.format(professional.price),
  };
}

export function getBookingSelection(
  route: BookingRoute,
  options: Awaited<ReturnType<typeof loadBookingOptions>>,
  date: string | null,
  scheduleId: string | null,
): RequiredBookingSelection | null {
  const selected = options?.days.find((day) => day.date === date)?.slots.find(({ id }) => id === scheduleId);
  if (!options || !selected) return null;
  return { ...route, professional: options.professional, scheduleId: selected.id, date: selected.date, time: selected.time };
}

export function getReviewSummary({ professional, date, time }: RequiredBookingSelection) {
  return formatBookingSummary({
    professionalId: professional.id,
    professionalName: professional.name,
    photoUrl: professional.photoUrl,
    specialty: professional.specialty,
    location: professional.neighborhood,
    price: professional.price,
    date,
    time,
  });
}

type BookingSummaryFields = Pick<Appointment, 'professionalId' | 'professionalName' | 'photoUrl' | 'specialty' | 'location' | 'price' | 'date' | 'time'>;

export function formatBookingSummary(appointment: BookingSummaryFields) {
  return {
    ...appointment,
    dateLabel: dateLabelFormat.format(new Date(appointment.date + 'T12:00:00')),
    priceLabel: priceFormat.format(appointment.price),
  };
}

export async function confirmBooking(selection: RequiredBookingSelection): Promise<BookingConfirmation> {
  const { professional, professionalId, scheduleId, mode, demo } = selection;
  if (demo) {
    return {
      mode, demo,
      appointment: {
        id: mode === 'reschedule' ? selection.appointmentId : scheduleId,
        professionalId, professionalName: professional.name, photoUrl: professional.photoUrl, specialty: professional.specialty,
        location: professional.neighborhood, price: professional.price, status: 'confirmed',
        date: selection.date, time: selection.time,
      },
    };
  }

  const dto = mode === 'new'
    ? await createBooking(scheduleId)
    : await rescheduleBooking(selection.appointmentId, scheduleId);
  return {
    mode,
    appointment: {
      ...normalizeAppointment(dto),
      professionalName: professional.name,
      photoUrl: professional.photoUrl,
      specialty: professional.specialty,
      location: professional.neighborhood,
    },
  };
}

export function getBookingError(error: unknown, mode: BookingRoute['mode']) {
  if (error instanceof ApiError && (
    (error.status === 409 && error.detail === 'Horário indisponível') ||
    (error.status === 404 && error.detail === 'Horário não encontrado')
  )) {
    return { chooseAnother: true, message: 'Este horário acabou de ficar indisponível. Escolha outro horário.' };
  }
  const title = mode === 'reschedule' ? 'Não foi possível remarcar sua consulta.' : 'Não foi possível confirmar sua consulta.';
  const detail = error instanceof ApiError ? error.detail ?? getApiErrorMessage(error) : getApiErrorMessage(error);
  return { chooseAnother: false, message: title + ' ' + detail };
}
