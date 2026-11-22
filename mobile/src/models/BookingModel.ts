import type { Professional } from './SearchModel';

export type BookingProfessional = Pick<Professional, 'id' | 'name' | 'specialty' | 'neighborhood' | 'price'>;

export type BookingDateOption = {
  date: string;
  weekday: string;
  day: number;
  label: string;
};

export type BookingTimeSlot = {
  time: string;
};

export type BookingSelection = {
  professionalId: string;
  date: string | null;
  time: string | null;
};
