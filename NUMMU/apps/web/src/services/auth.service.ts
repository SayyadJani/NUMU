/**
 * Authentication Service for NUMU Web Application
 * Interacts with /api/v1/auth endpoints using secure HttpOnly cookie credentials.
 * Strictly avoids browser storage (no localStorage, sessionStorage, or IndexedDB).
 */

import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { User, AuthResponse } from '@numu/types';

export interface RegisterPayload {
  email: string;
  password: string;
  username?: string | undefined;
  name?: string | undefined;
  college?: string | undefined;
  gradYear?: number | undefined;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export const authService = {
  /**
   * Registers a new student account.
   * Sets secure HttpOnly cookies on the client without writing to browser storage.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
  },

  /**
   * Authenticates with email or username.
   * Sets secure HttpOnly cookies without writing to browser storage.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
  },

  /**
   * Logs out the current user session and clears server session + HttpOnly cookies.
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Logs out from all active sessions across all devices for this user.
   */
  async logoutAll(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/logout-all');
  },

  /**
   * Lists all active sessions for current user with device metadata.
   */
  async getSessions(): Promise<ActiveSession[]> {
    return apiClient.get<ActiveSession[]>('/auth/sessions');
  },

  /**
   * Revokes a specific remote session by session ID.
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  },

  /**
   * Fetches the current authenticated user identity and profile from the server.
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>(ENDPOINTS.AUTH.ME);
  },

  /**
   * Rotates token using HttpOnly refresh cookie.
   */
  async refresh(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH);
  },

  /**
   * Sends password reset request.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  /**
   * Resets password using token.
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },
};
