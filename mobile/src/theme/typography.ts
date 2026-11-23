export const typography = {
  brand: 20,
  profile: 12,
  greeting: 24,
  body: 15,
  appointmentTitle: 18,
  professionalName: 16,
  caption: 13,
  sectionTitle: 19,
  button: 15,
} as const;

export type AppTypography = { [Key in keyof typeof typography]: number };

export const largeTypography: AppTypography = {
  brand: 23,
  profile: 14,
  greeting: 28,
  body: 18,
  appointmentTitle: 21,
  professionalName: 19,
  caption: 15,
  sectionTitle: 22,
  button: 18,
};
