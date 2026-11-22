export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://e-ai-marcou.onrender.com')
  .replace(/\/+$/, '');

export const demoPatient = {
  id: 'paciente-demo',
  name: 'Ana',
  savedLocations: ['Minha casa', 'Casa de Mainha'],
} as const;
