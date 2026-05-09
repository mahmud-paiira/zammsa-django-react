import api from './client';
import { LoginCredentials, AuthTokens, User } from '../types';

export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<AuthTokens>('/auth/login/', data).then((r) => r.data),

  mfaLogin: (email: string, code: string) =>
    api.post<AuthTokens>('/auth/mfa-login/', { email, code }).then((r) => r.data),

  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),

  me: () => api.get<User>('/auth/me/').then((r) => r.data),

  changePassword: (data: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => api.post('/auth/change-password/', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password/', { email }),

  resetPassword: (data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }) => api.post('/auth/reset-password/', data),

  mfaSetup: () => api.post<{ secret: string; qr_code: string }>('/auth/mfa/setup/').then((r) => r.data),

  mfaVerify: (code: string) =>
    api.post<{ verified: boolean }>('/auth/mfa/verify/', { code }).then((r) => r.data),

  refreshToken: async (refresh: string) => {
    const r = await api.post<{ access: string }>('/auth/login/refresh/', { refresh });
    return r.data;
  },
};
