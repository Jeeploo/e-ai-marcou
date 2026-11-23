export const colors = {
  background: '#F7F9FB',
  surface: '#FFFFFF',
  primary: '#123B3A',
  secondary: '#EDF3F3',
  accent: '#A83718',
  textPrimary: '#202D42',
  textSecondary: '#485B71',
  border: '#859B9A',
  success: '#245D47',
} as const;

export type AppColors = { [Key in keyof typeof colors]: string };

export const highContrastColors: AppColors = {
  background: '#F7F9FB',
  surface: '#FFFFFF',
  primary: '#0B302E',
  secondary: '#DDECE9',
  accent: '#852810',
  textPrimary: '#121D2C',
  textSecondary: '#293849',
  border: '#4D6463',
  success: '#194936',
};
