import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../views/screens/HomeScreen';
import { SearchScreen } from '../views/screens/SearchScreen';
import { AppointmentsScreen } from '../views/screens/AppointmentsScreen';
import { ProfileScreen } from '../views/screens/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarIcon: () => null }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início', headerShown: false }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Consultas' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
