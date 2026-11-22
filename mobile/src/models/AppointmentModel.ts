export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';
export type AppointmentListCategory = 'upcoming' | 'past';

export type Appointment = {
  id: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  price: number;
  status: AppointmentStatus;
};
