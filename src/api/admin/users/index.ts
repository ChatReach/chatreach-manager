import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type { AdminUsersResponse } from './types';

export const searchUsers = (search: string) =>
  fetchClient<AdminUsersResponse>(API_ROUTES.ADMIN.USERS, {
    params: { search, 'page[size]': 20 },
  });
