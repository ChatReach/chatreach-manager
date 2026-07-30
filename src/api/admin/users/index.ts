import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type { AdminUser, AdminUsersResponse } from './types';

export const getUsers = (params?: Record<string, string | number>) =>
  fetchClient<AdminUsersResponse>(API_ROUTES.ADMIN.USERS, { params });

export const getUser = (id: string) =>
  fetchClient<AdminUser>(API_ROUTES.ADMIN.USER(id));

export const searchUsers = (search: string) =>
  fetchClient<AdminUsersResponse>(API_ROUTES.ADMIN.USERS, {
    params: { search, 'page[size]': 20 },
  });
