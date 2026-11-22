import type { Professional, SearchFilters } from '../models/SearchModel';

const professionals: readonly Professional[] = [
  {
    id: 'marina',
    name: 'Dra. Marina Souza',
    specialty: 'Dermatologia',
    neighborhood: 'Boa Viagem',
    distanceKm: 1.8,
    price: 180,
    nextTime: 'Hoje, 16:30',
  },
  {
    id: 'carlos',
    name: 'Dr. Carlos Almeida',
    specialty: 'Cardiologia',
    neighborhood: 'Boa Saúde',
    distanceKm: 3.2,
    price: 150,
    nextTime: 'Amanhã, 09:00',
  },
  {
    id: 'ana',
    name: 'Dra. Ana Beatriz',
    specialty: 'Ortopedia',
    neighborhood: 'Madalena',
    distanceKm: 5.4,
    price: 130,
    nextTime: 'Amanhã, 14:30',
  },
  {
    id: 'felipe',
    name: 'Dr. Felipe Lima',
    specialty: 'Clínica geral',
    neighborhood: 'Casa Forte',
    distanceKm: 2.4,
    price: 100,
    nextTime: 'Hoje, 18:00',
  },
];

export function findProfessionalById(id: string) {
  return professionals.find((professional) => professional.id === id);
}

export function clearSearchFilters(): SearchFilters {
  return { specialty: null, minPrice: '', maxPrice: '', order: 'Recomendados' };
}

function parsePrice(value: string) {
  return Number(value.trim().replace(',', '.'));
}

export function validateSearchFilters({ minPrice, maxPrice }: SearchFilters) {
  const isValidPrice = (value: string) =>
    /^\d+(?:[,.]\d{1,2})?$/.test(value.trim()) && Number.isFinite(parsePrice(value));

  if ((minPrice && !isValidPrice(minPrice)) || (maxPrice && !isValidPrice(maxPrice))) {
    return 'Informe um preço válido, como 150 ou 150,50.';
  }
  if (minPrice && maxPrice && parsePrice(minPrice) > parsePrice(maxPrice)) {
    return 'O preço máximo deve ser igual ou maior que o mínimo.';
  }
  return null;
}

export function searchProfessionals(query: string, filters: SearchFilters) {
  const term = query.trim().toLowerCase();
  const min = filters.minPrice ? parsePrice(filters.minPrice) : 0;
  const max = filters.maxPrice ? parsePrice(filters.maxPrice) : Infinity;

  const results = professionals.filter(({ name, specialty, price }) =>
    (name.toLowerCase().includes(term) || specialty.toLowerCase().includes(term)) &&
    (!filters.specialty || filters.specialty === specialty) &&
    price >= min && price <= max,
  );

  if (filters.order === 'Menor preço') {
    results.sort((first, second) => first.price - second.price);
  }
  if (filters.order === 'Mais perto') {
    results.sort((first, second) => first.distanceKm - second.distanceKm);
  }
  return results;
}
