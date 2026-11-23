import type { Appointment } from './AppointmentModel';
import type { Professional } from './SearchModel';

export type BookingProfessional = Pick<Professional, 'id' | 'name' | 'photoUrl' | 'specialty' | 'neighborhood' | 'price'>;

export type ScheduleSlot = {
  id: string;
  professionalId: string;
  date: string;
  time: string;
  available: boolean;
};

export type ScheduleDto = {
  id: string;
  profissionalId: string;
  clinicaId: string;
  data: string;
  hora: string;
  disponivel: boolean;
};

type BookingIntent = { mode: 'new' } | { mode: 'reschedule'; appointmentId: string };

export type BookingRoute = BookingIntent & {
  professionalId: string;
  professional?: BookingProfessional;
  demo?: boolean;
};

export type RequiredBookingSelection = BookingIntent & {
  professionalId: string;
  professional: BookingProfessional;
  demo?: boolean;
  scheduleId: string;
  date: string;
  time: string;
};

export type BookingConfirmation = Pick<BookingIntent, 'mode'> & {
  appointment: Appointment;
  demo?: boolean;
};
