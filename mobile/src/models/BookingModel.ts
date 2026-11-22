import type { Professional } from './SearchModel';

export type BookingProfessional = Pick<Professional, 'id' | 'name' | 'neighborhood' | 'price'> & { specialty: string };

export type BookingDateOption = {
  date: string;
  weekday: string;
  day: number;
  label: string;
};

export type BookingTimeSlot = {
  time: string;
};

export type RequiredBookingSelection = {
  demoProfessional?: BookingProfessional;
  professionalId: string;
  date: string;
  time: string;
};

export type BookingSelection = {
  professionalId: string;
  date: string | null;
  time: string | null;
};
