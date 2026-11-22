export type NextAppointment = {
  professionalName: string;
  specialty: string;
  statusText: string;
};

export type Specialty = {
  id: string;
  name: string;
};

export type HomeData = {
  patientName: string;
  nextAppointment: NextAppointment;
  specialties: Specialty[];
};
