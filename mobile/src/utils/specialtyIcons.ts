import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

const specialtyIcons: Readonly<Record<string, ComponentProps<typeof Ionicons>['name'] | undefined>> = {
  cardiologia: 'heart-outline',
  'clinica geral': 'medkit-outline',
  dermatologia: 'sparkles-outline',
  ginecologia: 'female-outline',
  ortopedia: 'body-outline',
};

export function getSpecialtyIcon(specialty: string) {
  const key = specialty.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  return Object.hasOwn(specialtyIcons, key) ? specialtyIcons[key] : undefined;
}
