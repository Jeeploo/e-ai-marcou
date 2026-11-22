import type { HomeData } from '../models/HomeModel';

export function getHomeData(): HomeData {
  return {
    patientName: 'Ana',
    nextAppointment: {
      professionalName: 'Dra. Marina Souza',
      specialty: 'Dermatologia',
      statusText: 'Sua consulta está confirmada.',
    },
    specialties: [
      { id: 'cardiology', name: 'Cardiologia' },
      { id: 'dermatology', name: 'Dermatologia' },
      { id: 'orthopedics', name: 'Ortopedia' },
      { id: 'general-practice', name: 'Clínica geral' },
    ],
  };
}
