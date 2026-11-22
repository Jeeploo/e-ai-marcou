import type { NavigatorScreenParams } from '@react-navigation/native';
import type { RequiredBookingSelection } from '../models/BookingModel';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BookingSlots: { professionalId: string };
  BookingReview: RequiredBookingSelection;
  BookingConfirmation: RequiredBookingSelection;
};
