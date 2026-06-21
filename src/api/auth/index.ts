import { API_ROUTES } from '@/constants/api';
import { fetchClient } from '@/api/fetchClient';
import { LoginParams, LoginResponse } from '@/api/auth/types';

export const getSession = async () => {
  return await fetchClient(API_ROUTES.AUTH.SESSION);
};

export const login = async (params: LoginParams) => {
  return await fetchClient<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const logout = async () => {
  return await fetchClient(API_ROUTES.AUTH.LOGOUT, {
    method: 'POST',
  });
};
