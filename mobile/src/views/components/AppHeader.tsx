import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type AppHeaderProps = {
  patientName: string;
  compact: boolean;
  onAccessibilityPress?: () => void;
};

export function AppHeader({ patientName, compact, onAccessibilityPress }: AppHeaderProps) {
  return (
    <View style={[styles.header, compact && styles.compactHeader]}>
      <View style={[styles.identity, compact && styles.compactIdentity]}>
        <Text style={styles.brand} maxFontSizeMultiplier={1.25}>
          e aí, <Text style={styles.brandAccent}>marcou?</Text>
        </Text>
        <Text style={styles.patient}>{patientName}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={compact ? "Abrir configurações de acessibilidade" : "Acessibilidade"}
        accessibilityState={{ disabled: !onAccessibilityPress }}
        disabled={!onAccessibilityPress}
        onPress={onAccessibilityPress}
        style={[styles.accessibilityButton, compact && styles.compactButton]}
      >
        {compact ? (
          <Text accessible={false} importantForAccessibility="no" style={styles.accessibilityIcon}>⚙</Text>
        ) : (
          <Text style={styles.accessibilityLabel}>Acessibilidade</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  compactHeader: { flexWrap: 'nowrap' },
  compactIdentity: { flex: 1 },
  identity: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  brand: {
    fontSize: typography.brand,
    fontWeight: '700',
    color: colors.primary,
  },
  brandAccent: { color: colors.accent },
  patient: { fontSize: typography.profile, fontWeight: '600', color: colors.textSecondary },
  accessibilityButton: {
    maxWidth: '100%',
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  compactButton: {
    minWidth: spacing.touchTarget,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  accessibilityIcon: { color: colors.primary, fontSize: typography.brand },
  accessibilityLabel: {
    color: colors.primary,
    fontSize: typography.button,
    fontWeight: '600',
  },
});
