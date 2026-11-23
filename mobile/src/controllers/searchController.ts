import type { LocationReference, Professional, SearchFilters, SearchOrder } from '../models/SearchModel';
import { getProfessionals, getSearchSpecialties, type ProfessionalSearchDto } from '../services/professionalsService';

const distanceFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const shortDateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

const apiOrders = {
  Recomendados: 'recomendados',
  'Mais perto': 'distancia',
  'Menor preço': 'preco',
} as const satisfies Record<SearchOrder, string>;

// Referências de demonstração já usadas no cliente web.
const coordinates = {
  Casa: { latitude: -8.115, longitude: -34.895 },
  'Casa de Mainha': { latitude: -8.025, longitude: -34.915 },
};

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function normalizeProfessional(dto: ProfessionalSearchDto): Professional {
  const slot = dto.proximoHorario;
  return {
    id: dto.id,
    name: dto.nome,
    photoUrl: dto.fotoUrl,
    specialty: dto.especialidade,
    neighborhood: dto.clinica.bairro || dto.clinica.nome,
    distanceKm: dto.distanciaKm,
    distanceLabel: formatDistance(dto.distanciaKm),
    price: dto.valorConsulta,
    nextTime: slot ? shortDateFormat.format(new Date(slot.data + 'T12:00:00')) + ', ' + slot.hora : null,
  };
}

function formatDistance(distance: number | null) {
  return distance === null ? null : distanceFormat.format(distance) + ' km';
}

export async function searchRemoteProfessionals(query: string, filters: SearchFilters, location: LocationReference) {
  const specialty = filters.specialty;
  const match = specialty
    ? (await getSearchSpecialties()).find(({ nome }) => normalizeName(nome) === normalizeName(specialty))
    : undefined;
  if (specialty && !match) return [];

  const results = await getProfessionals({
    q: query.trim(),
    ordem: apiOrders[filters.order],
    ...(match && { especialidadeId: match.id }),
    ...(filters.maxPrice && { valorMaximo: parsePrice(filters.maxPrice) }),
    ...(location !== 'Minha localização' && coordinates[location]),
  });

  // A API aceita apenas valor máximo. Aplica o mínimo sem alterar a ordem recebida.
  const minimum = filters.minPrice ? parsePrice(filters.minPrice) : 0;
  return results.filter(({ valorConsulta }) => valorConsulta >= minimum).map(normalizeProfessional);
}

const professionals: readonly Professional[] = [
  {
    id: 'marina',
    name: 'Dra. Marina Souza',
    specialty: 'Dermatologia',
    neighborhood: 'Boa Viagem',
    distanceKm: 1.8,
    distanceLabel: formatDistance(1.8),
    price: 180,
    nextTime: 'Hoje, 16:30',
  },
  {
    id: 'carlos',
    name: 'Dr. Carlos Almeida',
    specialty: 'Cardiologia',
    neighborhood: 'Boa Saúde',
    distanceKm: 3.2,
    distanceLabel: formatDistance(3.2),
    price: 150,
    nextTime: 'Amanhã, 09:00',
  },
  {
    id: 'ana',
    name: 'Dra. Ana Beatriz',
    specialty: 'Ortopedia',
    neighborhood: 'Madalena',
    distanceKm: 5.4,
    distanceLabel: formatDistance(5.4),
    price: 130,
    nextTime: 'Amanhã, 14:30',
  },
  {
    id: 'felipe',
    name: 'Dr. Felipe Lima',
    specialty: 'Clínica geral',
    neighborhood: 'Casa Forte',
    distanceKm: 2.4,
    distanceLabel: formatDistance(2.4),
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

export function searchDemoProfessionals(query: string, filters: SearchFilters) {
  const term = normalizeName(query);
  const min = filters.minPrice ? parsePrice(filters.minPrice) : 0;
  const max = filters.maxPrice ? parsePrice(filters.maxPrice) : Infinity;

  const results = professionals.filter(({ name, specialty, price }) =>
    (normalizeName(name).includes(term) || normalizeName(specialty).includes(term)) &&
    (!filters.specialty || filters.specialty === specialty) &&
    price >= min && price <= max,
  );

  if (filters.order === 'Menor preço') {
    results.sort((first, second) => first.price - second.price);
  }
  if (filters.order === 'Mais perto') {
    results.sort((first, second) => (first.distanceKm ?? Infinity) - (second.distanceKm ?? Infinity));
  }
  return results;
}
