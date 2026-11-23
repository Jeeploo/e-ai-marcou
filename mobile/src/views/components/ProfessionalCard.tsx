import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { StyleSheet, Text, View } from 'react-native';
import type { Professional } from '../../models/SearchModel';
import { ProfessionalIdentity } from './ProfessionalIdentity';
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

export function ProfessionalCard({ professional, compact, onViewTimes }: ProfessionalCardProps) {
  const styles = useThemedStyles(createStyles);
  const { name, specialty, neighborhood, distanceLabel, price, nextTime } = professional;

  return (
    <View style={styles.card}>
      <ProfessionalIdentity professionalId={professional.id} photoUrl={professional.photoUrl} name={name} specialty={specialty} heading />
      <Text style={styles.detail}>{neighborhood}{distanceLabel && (compact ? '\n' : ' · ') + distanceLabel}</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>{nextTime ? 'Próximo horário: ' + nextTime : 'Sem previsão de próximo horário'}</Text>
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
  detail: { color: colors.textSecondary, fontSize: typography.body },
  price: { color: colors.primary, fontSize: typography.appointmentTitle, fontWeight: '700' },
});
