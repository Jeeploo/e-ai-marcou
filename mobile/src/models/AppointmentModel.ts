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

export type AppointmentDto = {
  id: string;
  pacienteId: string;
  profissionalId: string;
  clinicaId: string;
  data: string;
  hora: string;
  valor: number;
  status: 'agendado' | 'cancelado';
};

type CatalogEntry = { id: string; nome: string };

export type AppointmentCatalog = {
  professionals: (CatalogEntry & { especialidadeId: string })[];
  clinics: CatalogEntry[];
  specialties: CatalogEntry[];
};
