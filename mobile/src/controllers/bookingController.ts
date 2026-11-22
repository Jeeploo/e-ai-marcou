import type {
  BookingDateOption,
  BookingProfessional,
  BookingSelection,
  BookingTimeSlot,
  RequiredBookingSelection,
} from '../models/BookingModel';
import { findProfessionalById } from './searchController';

const timesByProfessional: Record<string, readonly string[]> = {
  marina: ['14:30', '15:30', '16:30'],
  carlos: ['09:00', '10:00', '11:00'],
  ana: ['14:30', '15:30', '16:30'],
  felipe: ['16:00', '17:00', '18:00'],
};

const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const dateLabelFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' });
const priceFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function getBookingOptions(professionalId: string) {
  const professional: BookingProfessional | undefined = findProfessionalById(professionalId);
  if (!professional) return null;

  const today = new Date();
  const dates = [1, 2, 3].map((offset): BookingDateOption => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = weekdayFormat.format(date).replace(/\.$/, '');

    return {
      date: `${date.getFullYear()}-${month}-${day}`,
      weekday,
      day: date.getDate(),
      label: dateLabelFormat.format(date),
    };
  });
  const times = (timesByProfessional[professionalId] ?? []).map((time): BookingTimeSlot => ({ time }));

  return { professional, dates, times, priceLabel: priceFormat.format(professional.price) };
}

export function isBookingSelectionComplete(
  selection: BookingSelection,
  options: ReturnType<typeof getBookingOptions>,
): selection is RequiredBookingSelection {
  return options !== null
    && selection.professionalId === options.professional.id
    && options.dates.some(({ date }) => date === selection.date)
    && options.times.some(({ time }) => time === selection.time);
}

export function getBookingSummary({ professionalId, date, time }: RequiredBookingSelection) {
  const professional = findProfessionalById(professionalId);
  const selectedDate = new Date(`${date}T00:00:00`);

  if (!professional || !timesByProfessional[professionalId]?.includes(time) || Number.isNaN(selectedDate.getTime())) {
    return null;
  }

  return {
    professional,
    dateLabel: dateLabelFormat.format(selectedDate),
    time,
    priceLabel: priceFormat.format(professional.price),
  };
}
