export type Specialty = {
  id: string;
  name: string;
};

export type HomeData = {
  patientName: string;
  specialties: Specialty[];
};
