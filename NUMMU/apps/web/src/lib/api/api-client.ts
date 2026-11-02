/**
 * Central HTTP API Client
 * Uses standard Fetch API with HttpOnly cookie session management,
 * single-flight refresh mutex deduplication, error handling, and timeout support.
 * Strictly avoids browser storage (no localStorage, sessionStorage, or IndexedDB).
 */

import { envConfig } from '../config/env';
import { ApiError, NetworkError } from './errors';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined> | undefined;
  timeoutMs?: number | undefined;
  token?: string | undefined;
  _isRetry?: boolean | undefined;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = envConfig.apiUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${this.baseUrl}${cleanPath}`;

    let url: URL;
    if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
      url = new URL(fullUrl);
    } else if (typeof window !== 'undefined') {
      url = new URL(fullUrl, window.location.origin);
    } else {
      const serverBase = process.env['INTERNAL_API_URL'] || process.env['BACKEND_URL'] || 'http://localhost:4000';
      url = new URL(fullUrl, serverBase);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Refreshes access token with in-flight mutex deduplication.
   * Prevents simultaneous 401s from triggering multiple token rotations.
   * Features strict 10s timeout to prevent hanging network requests.
   * Operates purely via HttpOnly cookies with ZERO browser storage persistence.
   */
  private async refreshSession(): Promise<boolean> {
    if (ApiClient.refreshPromise) {
      return ApiClient.refreshPromise;
    }

    ApiClient.refreshPromise = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const refreshUrl = this.buildUrl('/auth/refresh');
        const refreshRes = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        return refreshRes.ok;
      } catch {
        return false;
      } finally {
        clearTimeout(timeoutId);
        ApiClient.refreshPromise = null;
      }
    })();

    return ApiClient.refreshPromise;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, timeoutMs = 15000, token, headers = {}, _isRetry, ...customConfig } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    };

    // If an explicit bearer token is supplied (e.g. CLI or server-side calls)
    if (token) {
      (mergedHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      credentials: 'include',
      ...customConfig,
      headers: mergedHeaders,
      signal: controller.signal,
    };

    const targetUrl = this.buildUrl(path, params);

    try {
      const response = await fetch(targetUrl, config);
      clearTimeout(timeoutId);

      // Handle non-2xx responses
      if (!response.ok) {
        // Attempt automatic single-flight token refresh on 401 for authenticated application calls (if not already retrying)
        if (
          !_isRetry &&
          response.status === 401 &&
          !path.includes('/auth/login') &&
          !path.includes('/auth/register') &&
          !path.includes('/auth/refresh')
        ) {
          const refreshed = await this.refreshSession();
          if (refreshed) {
            // Re-dispatch through request() with _isRetry: true.
            // Guarantees timeout coverage, preserves exact retry errors, and prevents infinite loops.
            return this.request<T>(path, { ...options, _isRetry: true });
          }
        }

        let errorData: { message?: string; code?: string; details?: Record<string, unknown> } = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw new ApiError({
          message: errorData.message || `Request failed with status ${response.status}`,
          statusCode: response.status,
          code: errorData.code || `HTTP_${response.status}`,
          details: errorData.details,
        });
      }

      // Empty response (e.g. 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return (data.data !== undefined ? data.data : data) as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError({
          message: `Request timed out after ${timeoutMs}ms`,
          statusCode: 408,
          code: 'TIMEOUT',
        });
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const opts: RequestOptions = { ...options, method: 'POST' };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return this.request<T>(path, opts);
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const opts: RequestOptions = { ...options, method: 'PUT' };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return this.request<T>(path, opts);
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const opts: RequestOptions = { ...options, method: 'PATCH' };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return this.request<T>(path, opts);
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

/**
 * Singleton API Client instance configured with app environment
 */
export const apiClient = new ApiClient();
