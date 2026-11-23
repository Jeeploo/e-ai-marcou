import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { Platform, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { HomeScreen } from '../views/screens/HomeScreen';
import { SearchScreen } from '../views/screens/SearchScreen';
import { AppointmentsScreen } from '../views/screens/AppointmentsScreen';
import { ProfileScreen } from '../views/screens/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const tabIcons = {
  Home: 'home-outline',
  Search: 'search-outline',
  Appointments: 'calendar-outline',
  Profile: 'person-outline',
} as const;
const tabTitles: Record<keyof MainTabParamList, string> = {
  Home: 'Início',
  Search: 'Buscar',
  Appointments: 'Consultas',
  Profile: 'Perfil',
};

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const { fonts } = useTheme();
  const { fontScale } = useWindowDimensions();
  const isCompact = useCompactLayout();
  const isAndroid = Platform.OS === 'android';
  const useCompactLabel = isAndroid && isCompact;
  const bottomPadding = isAndroid ? Math.max(insets.bottom, 8) : insets.bottom;
  const topPadding = isAndroid ? 6 : 0;
  const labelFontSize = isAndroid ? 12 : 10;
  const extraLabelHeight = Math.ceil(Math.max(0, fontScale - 1) * (labelFontSize + 4));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        title: tabTitles[route.name],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} color={color} size={size} accessible={false} />
        ),
        tabBarIconSize: isAndroid ? 22 : undefined,
        tabBarLabelPosition: 'below-icon',
        tabBarAllowFontScaling: true,
        tabBarAccessibilityLabel: tabTitles[route.name],
        tabBarLabel: ({ children, color }) => (
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
            adjustsFontSizeToFit={useCompactLabel}
            minimumFontScale={0.85}
            style={[
              fonts.medium,
              { color, fontSize: labelFontSize, textAlign: 'center', maxWidth: '100%' },
              useCompactLabel && { fontSize: 11, lineHeight: 14 },
            ]}
          >
            {children}
          </Text>
        ),
        tabBarItemStyle: { minHeight: isAndroid ? 48 : 44 },
        tabBarStyle: {
          height: (isAndroid ? 57 : 49) + bottomPadding + extraLabelHeight,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
