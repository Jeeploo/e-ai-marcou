import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BookingProfessional, RequiredBookingSelection } from '../models/BookingModel';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Profile: { showAccessibility?: boolean } | undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BookingSlots: { professionalId: string; demoProfessional?: BookingProfessional };
  BookingReview: RequiredBookingSelection;
  BookingConfirmation: RequiredBookingSelection;
  AppointmentDetails: { appointmentId: string };
};
