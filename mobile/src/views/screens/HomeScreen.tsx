import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHomeData } from '../../controllers/homeController';
import type { MainTabParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../components/AppHeader';
import { NextAppointmentCard } from '../components/NextAppointmentCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SpecialtyButton } from '../components/SpecialtyButton';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { patientName, nextAppointment, specialties } = getHomeData();
  const openSearch = () => navigation.navigate('Search');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <AppHeader patientName={patientName} />

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.title}>Olá, {patientName}!</Text>
            <Text style={styles.description}>
              Encontre atendimento e acompanhe suas consultas.
            </Text>
          </View>

          <View style={styles.section}>
            <NextAppointmentCard appointment={nextAppointment} />
            <PrimaryButton
              label="Ver minhas consultas"
              variant="outline"
              onPress={() => navigation.navigate('Appointments')}
            />
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.subtitle}>O que você procura hoje?</Text>
            <View style={styles.specialties}>
              {specialties.map((specialty) => (
                <SpecialtyButton key={specialty.id} label={specialty.name} onPress={openSearch} />
              ))}
            </View>
          </View>

          <PrimaryButton label="Buscar profissionais" onPress={openSearch} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', gap: spacing.lg },
  section: { gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  description: { color: colors.textSecondary, fontSize: typography.body },
  subtitle: { color: colors.textPrimary, fontSize: typography.sectionTitle, fontWeight: '700' },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
