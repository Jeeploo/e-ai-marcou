import { demoPatient } from '../config/api';
import type { HomeData } from '../models/HomeModel';

export function getHomeData(): HomeData {
  return {
    patientName: demoPatient.name,
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
