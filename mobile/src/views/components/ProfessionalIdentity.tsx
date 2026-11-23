import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import { spacing } from '../../theme/spacing';
import { getDoctorNameWithoutTitle, getDoctorPhoto } from '../../utils/doctorAssets';
import { SpecialtyIcon } from './SpecialtyIcon';

type ProfessionalIdentityProps = {
  professionalId?: string;
  photoUrl?: string | null;
  name: string;
  specialty: string;
  heading?: boolean;
};

function DoctorAvatar({ name, photo }: { name: string; photo: ImageSourcePropType | undefined }) {
  const styles = useThemedStyles(createStyles);
  const [photoFailed, setPhotoFailed] = useState(false);
  const parts = getDoctorNameWithoutTitle(name).split(/\s+/);
  const initials = (parts[0].slice(0, 1) + (parts.length > 1 ? parts[parts.length - 1].slice(0, 1) : '')).toUpperCase();

  return (
    <View style={styles.avatar} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {photo !== undefined && !photoFailed ? (
        <Image style={styles.photo} source={photo} resizeMode="cover" onError={() => setPhotoFailed(true)} />
      ) : (
        <Text style={styles.initials} maxFontSizeMultiplier={1.5}>{initials}</Text>
      )}
    </View>
  );
}

export function ProfessionalIdentity({ professionalId, photoUrl, name, specialty, heading }: ProfessionalIdentityProps) {
  const styles = useThemedStyles(createStyles);
  const compact = useCompactLayout();
  const photo = getDoctorPhoto({ professionalId, photoUrl, name });
  const photoKey = typeof photo === 'number' ? photo : photoUrl ?? name;

  return (
    <View style={[styles.identity, !compact && styles.horizontal]}>
      <DoctorAvatar key={photoKey} name={name} photo={photo} />
      <View style={[styles.details, !compact && styles.detailsColumn]}>
        <Text accessibilityRole={heading ? 'header' : undefined} style={styles.name}>{name}</Text>
        <View style={styles.specialtyRow}>
          <SpecialtyIcon specialty={specialty} />
          <Text style={styles.specialty}>{specialty}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  identity: { alignItems: 'flex-start', gap: spacing.sm },
  horizontal: { flexDirection: 'row', gap: spacing.md },
  details: { gap: spacing.xs, maxWidth: '100%' },
  detailsColumn: { flex: 1, minWidth: 0 },
  name: { color: colors.textPrimary, fontSize: typography.appointmentTitle, fontWeight: '700' },
  specialtyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  specialty: { flexShrink: 1, color: colors.textSecondary, fontSize: typography.body },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
  },
  photo: { width: 54, height: 54 },
  initials: { color: colors.textPrimary, fontSize: typography.professionalName, fontWeight: '700' },
});
