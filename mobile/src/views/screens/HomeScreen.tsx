import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '../../contexts/AppointmentsContext';
import { listAppointments } from '../../controllers/appointmentController';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import { getHomeData } from '../../controllers/homeController';
import type { MainTabParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../components/AppHeader';
import { AppointmentStatusMessage } from '../components/AppointmentStatusMessage';
import { NextAppointmentCard } from '../components/NextAppointmentCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SpecialtyButton } from '../components/SpecialtyButton';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const styles = useThemedStyles(createStyles);
  const compact = useCompactLayout();
  const { patientName, specialties } = getHomeData();
  const { appointments, loading, error, demoMode } = useAppointments();
  const [nextAppointment] = listAppointments(appointments, 'upcoming');
  const appointmentMessage = error && !demoMode
    ? 'Não foi possível carregar a próxima consulta.'
    : 'Você não tem consultas marcadas.';
  const openSearch = () => navigation.navigate('Search');
  const columns = compact ? 1 : 2;
  const specialtyRows = [];
  for (let index = 0; index < specialties.length; index += columns) {
    specialtyRows.push(specialties.slice(index, index + columns));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, compact && styles.compactScrollContent]}>
        <View style={styles.content}>
          <AppHeader patientName={patientName} compact={compact} onAccessibilityPress={() => navigation.navigate('Profile', { showAccessibility: true })} />

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.title}>Olá, {patientName}!</Text>
            <Text style={styles.description}>
              Encontre atendimento e acompanhe suas consultas.
            </Text>
          </View>

          <View style={styles.section}>
            <NextAppointmentCard appointment={loading ? undefined : nextAppointment}>
              <AppointmentStatusMessage
                loading={loading}
                message={loading ? 'Carregando próxima consulta…' : appointmentMessage}
              />
            </NextAppointmentCard>
            <PrimaryButton
              label="Ver minhas consultas"
              variant="outline"
              onPress={() => navigation.navigate('Appointments')}
            />
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.subtitle}>O que você procura hoje?</Text>
            <View style={styles.specialties}>
              {specialtyRows.map((row) => (
                <View key={row[0].id} style={styles.specialtyRow}>
                  {row.map((specialty) => (
                    <SpecialtyButton key={specialty.id} label={specialty.name} onPress={openSearch} />
                  ))}
                </View>
              ))}
            </View>
          </View>

          <PrimaryButton label="Buscar profissionais" onPress={openSearch} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  compactScrollContent: { paddingBottom: spacing.xxl },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', gap: spacing.lg },
  section: { gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  description: { color: colors.textSecondary, fontSize: typography.body },
  subtitle: { color: colors.textPrimary, fontSize: typography.sectionTitle, fontWeight: '700' },
  specialties: { gap: spacing.sm },
  specialtyRow: { flexDirection: 'row', gap: spacing.sm },
});
