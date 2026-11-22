import type { Appointment, AppointmentCatalog, AppointmentDto, AppointmentListCategory, AppointmentStatus } from '../models/AppointmentModel';
import type { BookingProfessional } from '../models/BookingModel';

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
  // A agenda do backend usa o horário de Recife.
  return Date.parse(`${date}T${time}:00-03:00`);
}

export function getAppointmentStatusLabel(appointment: Appointment, now = new Date()) {
  return appointment.status === 'confirmed' && !canCancelAppointment(appointment, now)
    ? 'Horário passado'
    : statusLabels[appointment.status];
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
    .filter((appointment) => canCancelAppointment(appointment, now) === upcoming)
    .sort((first, second) => {
      const difference = getAppointmentDateTime(first) - getAppointmentDateTime(second);
      return upcoming ? difference : -difference;
    });
}

export function findAppointmentById(appointments: readonly Appointment[], appointmentId: string) {
  return appointments.find(({ id }) => id === appointmentId);
}

export function canCancelAppointment(appointment: Appointment, now = new Date()) {
  return appointment.status === 'confirmed' && getAppointmentDateTime(appointment) > now.getTime();
}

export function cancelLocalAppointment(appointments: Appointment[], appointmentId: string, now = new Date()) {
  return appointments.map((appointment): Appointment =>
    appointment.id === appointmentId && canCancelAppointment(appointment, now)
      ? { ...appointment, status: 'cancelled' }
      : appointment,
  );
}

export function normalizeAppointment(dto: AppointmentDto, catalog?: AppointmentCatalog): Appointment {
  const professional = catalog?.professionals.find(({ id }) => id === dto.profissionalId);
  const specialty = catalog?.specialties.find(({ id }) => id === professional?.especialidadeId);
  const clinic = catalog?.clinics.find(({ id }) => id === dto.clinicaId);
  return {
    id: dto.id,
    professionalId: dto.profissionalId,
    professionalName: professional?.nome ?? 'Nome do profissional indisponível',
    specialty: specialty?.nome ?? 'Especialidade indisponível',
    location: clinic?.nome ?? 'Local indisponível',
    date: dto.data,
    time: dto.hora,
    price: dto.valor,
    status: dto.status === 'cancelado' ? 'cancelled' : 'confirmed',
  };
}

export function getMockRescheduleProfessional(appointment: Appointment): BookingProfessional {
  return {
    id: appointment.professionalId,
    name: appointment.professionalName,
    specialty: appointment.specialty,
    neighborhood: appointment.location,
    price: appointment.price,
  };
}
