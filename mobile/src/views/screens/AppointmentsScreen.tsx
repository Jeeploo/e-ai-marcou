import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '../../contexts/AppointmentsContext';
import { listAppointments } from '../../controllers/appointmentController';
import type { AppointmentListCategory } from '../../models/AppointmentModel';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppointmentCard } from '../components/AppointmentCard';

type AppointmentsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Appointments'>,
  NativeStackScreenProps<RootStackParamList, 'MainTabs'>
>;

const tabs: { category: AppointmentListCategory; label: string }[] = [
  { category: 'upcoming', label: 'Próximas' },
  { category: 'past', label: 'Anteriores' },
];

export function AppointmentsScreen({ navigation }: AppointmentsScreenProps) {
  const [category, setCategory] = useState<AppointmentListCategory>('upcoming');
  const { appointments } = useAppointments();
  const isUpcoming = category === 'upcoming';

  function openReschedule(professionalId: string) {
    // Mock local: reutiliza os horários do agendamento sem atualizar a consulta original.
    navigation.navigate('BookingSlots', { professionalId });
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.screen}>
      <FlatList
        data={listAppointments(appointments, category)}
        keyExtractor={({ id }) => id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>Minhas consultas</Text>
            <Text style={styles.body}>Acompanhe seus próximos atendimentos e seu histórico.</Text>
            <View accessibilityRole="tablist" style={styles.tabs}>
              {tabs.map(({ category: tabCategory, label }) => {
                const selected = category === tabCategory;
                return (
                  <Pressable
                    key={tabCategory}
                    accessibilityRole="tab"
                    accessibilityLabel={label}
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(tabCategory)}
                    style={({ pressed }) => [
                      styles.tab,
                      selected && styles.selectedTab,
                      pressed && styles.pressedTab,
                    ]}
                  >
                    <Text style={[styles.tabLabel, selected && styles.selectedLabel]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onDetails={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
            onReschedule={isUpcoming ? () => openReschedule(item.professionalId) : undefined}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.body}>
            {isUpcoming ? 'Você não tem consultas marcadas.' : 'Seu histórico de consultas aparecerá aqui.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heading: { gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  body: { color: colors.textSecondary, fontSize: typography.body },
  tabs: { flexDirection: 'row', marginTop: spacing.sm },
  tab: {
    flex: 1,
    minHeight: spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  selectedTab: { borderBottomColor: colors.primary, backgroundColor: colors.secondary },
  pressedTab: { opacity: 0.8 },
  tabLabel: { color: colors.textSecondary, fontSize: typography.button, textAlign: 'center' },
  selectedLabel: { color: colors.primary, fontWeight: '700' },
});
