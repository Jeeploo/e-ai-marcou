import type { Appointment, AppointmentListCategory, AppointmentStatus } from '../models/AppointmentModel';

const statusLabels: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });
const priceFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function relativeDate(today: Date, offset: number) {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createMockAppointments(today = new Date()): Appointment[] {
  return [
    {
      id: 'appointment-marina',
      professionalId: 'marina',
      professionalName: 'Dra. Marina Souza',
      specialty: 'Dermatologia',
      location: 'Boa Viagem',
      date: relativeDate(today, 2),
      time: '14:30',
      price: 180,
      status: 'confirmed',
    },
    {
      id: 'appointment-carlos',
      professionalId: 'carlos',
      professionalName: 'Dr. Carlos Almeida',
      specialty: 'Cardiologia',
      location: 'Boa Saúde',
      date: relativeDate(today, -7),
      time: '09:00',
      price: 150,
      status: 'completed',
    },
  ];
}

function getAppointmentDateTime({ date, time }: Appointment) {
  return new Date(`${date}T${time}:00`).getTime();
}

function getEffectiveStatus(appointment: Appointment, now: Date): AppointmentStatus {
  if (appointment.status === 'confirmed' && getAppointmentDateTime(appointment) <= now.getTime()) {
    return 'completed';
  }
  return appointment.status;
}

export function getAppointmentStatusLabel(appointment: Appointment, now = new Date()) {
  return statusLabels[getEffectiveStatus(appointment, now)];
}

export function getAppointmentDateLabel({ date }: Appointment) {
  return dateFormat.format(new Date(`${date}T00:00:00`));
}

export function getAppointmentPriceLabel({ price }: Appointment) {
  return priceFormat.format(price);
}

export function listAppointments(
  appointments: readonly Appointment[],
  category: AppointmentListCategory,
  now = new Date(),
) {
  const upcoming = category === 'upcoming';
  return appointments
    .filter((appointment) => (getEffectiveStatus(appointment, now) === 'confirmed') === upcoming)
    .sort((first, second) => {
      const difference = getAppointmentDateTime(first) - getAppointmentDateTime(second);
      return upcoming ? difference : -difference;
    });
}

export function findAppointmentById(appointments: readonly Appointment[], appointmentId: string) {
  return appointments.find(({ id }) => id === appointmentId);
}

export function canCancelAppointment(appointment: Appointment, now = new Date()) {
  return getEffectiveStatus(appointment, now) === 'confirmed';
}

export function cancelLocalAppointment(appointments: Appointment[], appointmentId: string, now = new Date()) {
  return appointments.map((appointment): Appointment =>
    appointment.id === appointmentId && canCancelAppointment(appointment, now)
      ? { ...appointment, status: 'cancelled' }
      : appointment,
  );
}
