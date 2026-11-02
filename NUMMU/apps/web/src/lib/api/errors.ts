/**
 * Normalized API Error Classes & Types
 * Strictly compatible with exactOptionalPropertyTypes
 */

export interface ApiErrorPayload {
  message: string;
  statusCode?: number | undefined;
  code?: string | undefined;
  details?: Record<string, unknown> | string[] | undefined;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown> | string[] | undefined;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode ?? 500;
    this.code = payload.code ?? 'UNKNOWN_ERROR';
    this.details = payload.details;
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network connection failed. Please check your internet connection.') {
    super({
      message,
      statusCode: 0,
      code: 'NETWORK_ERROR',
    });
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super({
      message: `${resource} not found.`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required to access this resource.') {
    super({
      message,
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
    this.name = 'UnauthorizedError';
  }
}

/**
 * Normalizes any error caught during data fetching into a user-friendly ApiError.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      code: 'APP_ERROR',
    });
  }

  return new ApiError({
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
  });
}
