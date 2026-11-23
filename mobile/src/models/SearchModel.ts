export const specialties = ['Cardiologia', 'Dermatologia', 'Ortopedia', 'Clínica geral'] as const;
export const searchOrders = ['Recomendados', 'Mais perto', 'Menor preço'] as const;
export const locationReferences = ['Minha localização', 'Casa', 'Casa de Mainha'] as const;

export type Specialty = (typeof specialties)[number];
export type SearchOrder = (typeof searchOrders)[number];
export type LocationReference = (typeof locationReferences)[number];

export type Professional = {
  id: string;
  name: string;
  photoUrl?: string | null;
  specialty: string;
  neighborhood: string;
  distanceKm: number | null;
  distanceLabel: string | null;
  price: number;
  nextTime: string | null;
};

export type SearchFilters = {
  specialty: Specialty | null;
  minPrice: string;
  maxPrice: string;
  order: SearchOrder;
};
