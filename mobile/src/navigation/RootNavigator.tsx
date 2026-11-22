import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentsProvider } from '../contexts/AppointmentsContext';
import { colors } from '../theme/colors';
import { AppointmentDetailsScreen } from '../views/screens/AppointmentDetailsScreen';
import { BookingConfirmationScreen } from '../views/screens/BookingConfirmationScreen';
import { BookingReviewScreen } from '../views/screens/BookingReviewScreen';
import { BookingSlotsScreen } from '../views/screens/BookingSlotsScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <AppointmentsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="BookingSlots"
            component={BookingSlotsScreen}
            options={{
              title: 'Horários',
              headerBackTitle: 'Voltar',
              headerTintColor: colors.primary,
              headerStyle: { backgroundColor: colors.surface },
            }}
          />
          <Stack.Screen name="BookingReview" component={BookingReviewScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AppointmentDetails"
            component={AppointmentDetailsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppointmentsProvider>
  );
}
