import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { PrimaryButton } from './PrimaryButton';

export function EmptySearchState({ onClear }: { onClear: () => void }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.content} accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.title}>Nenhum profissional encontrado</Text>
      <Text style={styles.description}>Tente alterar ou limpar os filtros.</Text>
      <PrimaryButton label="Limpar filtros" variant="outline" onPress={onClear} />
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.textPrimary, fontSize: typography.sectionTitle, fontWeight: '700' },
  description: { color: colors.textSecondary, fontSize: typography.body },
});
