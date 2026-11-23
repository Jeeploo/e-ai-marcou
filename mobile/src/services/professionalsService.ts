import type { ScheduleDto } from '../models/BookingModel';
import { isPrice, isRecord, isScheduleDto } from '../utils/apiData';
import { invalidResponse, requestJson } from './api';

type SearchParams = {
  q: string;
  ordem: 'recomendados' | 'distancia' | 'preco';
  especialidadeId?: string;
  valorMaximo?: number;
  latitude?: number;
  longitude?: number;
};

export type ProfessionalSearchDto = {
  id: string;
  nome: string;
  fotoUrl?: string | null;
  especialidade: string;
  clinica: { nome: string; bairro: string };
  valorConsulta: number;
  distanciaKm: number | null;
  proximoHorario: ScheduleDto | null;
};

type SpecialtyDto = { id: string; nome: string; ativo: boolean };

function isProfessionalSearchDto(value: unknown): value is ProfessionalSearchDto {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.nome === 'string'
    && (value.fotoUrl == null || typeof value.fotoUrl === 'string')
    && typeof value.especialidade === 'string'
    && isRecord(value.clinica)
    && typeof value.clinica.nome === 'string'
    && typeof value.clinica.bairro === 'string'
    && isPrice(value.valorConsulta)
    && (value.distanciaKm === null || isPrice(value.distanciaKm))
    && (value.proximoHorario === null || isScheduleDto(value.proximoHorario));
}

function isSpecialtyDto(value: unknown): value is SpecialtyDto {
  return isRecord(value) && typeof value.id === 'string'
    && typeof value.nome === 'string'
    && typeof value.ativo === 'boolean';
}

export async function getSearchSpecialties() {
  const data = await requestJson('/api/especialidades');
  if (!Array.isArray(data) || !data.every(isSpecialtyDto)) throw invalidResponse();
  return data.filter(({ ativo }) => ativo);
}

export async function getProfessionals(params: SearchParams) {
  const query = Object.entries(params)
    .map(([key, value]) => key + '=' + encodeURIComponent(value))
    .join('&');
  const data = await requestJson('/api/profissionais/busca?' + query);
  if (!Array.isArray(data) || !data.every(isProfessionalSearchDto)) throw invalidResponse();
  return data;
}
