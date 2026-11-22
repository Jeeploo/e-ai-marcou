import { apiBaseUrl } from '../config/api';

type ApiErrorKind = 'http' | 'timeout' | 'network' | 'invalid-response';

export class ApiError extends Error {
  constructor(public readonly kind: ApiErrorKind, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function invalidResponse() {
  return new ApiError('invalid-response', 'O servidor enviou uma resposta inválida. Tente novamente.');
}

export function getApiErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Tente novamente em instantes.';
}

export async function requestJson(path: string, options: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (typeof options.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(apiBaseUrl + path, { ...options, headers, signal: controller.signal });
    if (!response.ok) {
      const message = response.status === 404
        ? 'Consulta não encontrada.'
        : response.status === 409
          ? 'A consulta mudou no servidor. Atualize suas consultas e confira o status.'
          : 'O servidor não conseguiu concluir a solicitação. Tente novamente.';
      throw new ApiError('http', message, response.status);
    }

    if (response.status === 204) return undefined;
    const body = await response.text();
    try {
      return JSON.parse(body) as unknown;
    } catch {
      throw invalidResponse();
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError('timeout', 'O servidor demorou para responder. Tente novamente.');
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError('network', 'Verifique sua conexão e tente novamente.');
  } finally {
    clearTimeout(timeout);
  }
}
