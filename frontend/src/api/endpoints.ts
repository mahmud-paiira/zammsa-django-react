import api from './client';
import { LoginCredentials, AuthTokens, User, PaginatedResponse } from '../types';

export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<AuthTokens>('/auth/login/', data).then((r) => r.data),
  mfaLogin: (email: string, code: string) =>
    api.post<AuthTokens>('/auth/mfa-login/', { email, code }).then((r) => r.data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) =>
    api.post('/auth/change-password/', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password/', { email }),
  resetPassword: (data: { token: string; new_password: string; confirm_password: string }) =>
    api.post('/auth/reset-password/', data),
  me: () => api.get<User>('/auth/me/').then((r) => r.data),
};

export const usersApi = {
  list: (params?: Record<string, any>) =>
    api.get<PaginatedResponse<User>>('/users/', { params }).then((r) => r.data),
  create: (data: Partial<User>) =>
    api.post<User>('/users/create/', data).then((r) => r.data),
  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}/`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}/`),
  export: () => api.get('/users/export/', { responseType: 'blob' }),
};
