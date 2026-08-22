import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type {
  AdminUser,
  AdminUsersResponse,
  UpdateUserPayload,
  UserPersonalData,
} from './types';

export const getUsers = (params?: Record<string, string | number>) =>
  fetchClient<AdminUsersResponse>(API_ROUTES.ADMIN.USERS, { params });

export const getUser = (id: string) =>
  fetchClient<AdminUser>(API_ROUTES.ADMIN.USER(id));

export const getUserPersonalData = (id: string) =>
  fetchClient<UserPersonalData>(API_ROUTES.ADMIN.USER_PERSONAL_DATA(id));

export const updateUser = (id: string, data: UpdateUserPayload) =>
  fetchClient<AdminUser>(API_ROUTES.ADMIN.USER(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const sendPasswordResetEmail = (id: string) =>
  fetchClient<{ status: string }>(API_ROUTES.ADMIN.USER_SEND_PASSWORD_RESET(id), {
    method: 'POST',
  });

export const searchUsers = (search: string) =>
  fetchClient<AdminUsersResponse>(API_ROUTES.ADMIN.USERS, {
    params: { search, 'page[size]': 20 },
  });
