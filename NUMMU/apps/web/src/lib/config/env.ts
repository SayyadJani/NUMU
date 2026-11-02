/**
 * Centralized Application & Environment Configuration
 * Safe for both client and server runtime in Next.js.
 */

export interface AppConfig {
  /** Base URL for backend REST API requests */
  apiUrl: string;
  /** Whether to use typed mock service implementations in development */
  useMocks: boolean;
  /** Application environment */
  environment: 'development' | 'production' | 'test';
  /** Application base title and metadata */
  appName: string;
}

export const envConfig: AppConfig = {
  apiUrl: process.env['NEXT_PUBLIC_API_URL'] || '/api/v1',
  // Default to mock data if explicitly requested
  useMocks: process.env['NEXT_PUBLIC_USE_MOCKS'] === 'true',
  environment: (process.env['NODE_ENV'] as AppConfig['environment']) || 'development',
  appName: 'NUMU',
};
