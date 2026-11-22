import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { BookingSlotsScreen } from '../views/screens/BookingSlotsScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
