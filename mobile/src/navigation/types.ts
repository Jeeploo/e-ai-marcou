import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BookingConfirmation, BookingRoute, RequiredBookingSelection } from '../models/BookingModel';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Profile: { showAccessibility?: boolean } | undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BookingSlots: BookingRoute & { reload?: number };
  BookingReview: RequiredBookingSelection;
  BookingConfirmation: BookingConfirmation;
  AppointmentDetails: { appointmentId: string };
};
