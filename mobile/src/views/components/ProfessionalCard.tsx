import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { StyleSheet, Text, View } from 'react-native';
import type { Professional } from '../../models/SearchModel';
import { spacing } from '../../theme/spacing';
import { PrimaryButton } from './PrimaryButton';

type ProfessionalCardProps = {
  professional: Professional;
  compact: boolean;
  onViewTimes: () => void;
};

const priceFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const distanceFormat = new Intl.NumberFormat('pt-BR');

export function ProfessionalCard({ professional, compact, onViewTimes }: ProfessionalCardProps) {
  const styles = useThemedStyles(createStyles);
  const { name, specialty, neighborhood, distanceKm, price, nextTime } = professional;

  const distance = `${distanceFormat.format(distanceKm)} km`;

  return (
    <View style={styles.card}>
      <View style={styles.details}>
        <Text accessibilityRole="header" style={styles.name}>{name}</Text>
        <Text style={styles.detail}>{specialty}</Text>
        <Text style={styles.detail}>{neighborhood}{compact ? '\n' : ' · '}{distance}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>Próximo horário: {nextTime}</Text>
        <Text style={styles.price}>{priceFormat.format(price)}</Text>
      </View>
      <PrimaryButton label="Ver horários" variant="outline" onPress={onViewTimes} />
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  details: { gap: spacing.xs },
  name: { color: colors.textPrimary, fontSize: typography.appointmentTitle, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: typography.body },
  price: { color: colors.primary, fontSize: typography.appointmentTitle, fontWeight: '700' },
});
