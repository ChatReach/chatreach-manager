import { API_ROUTES } from '@/constants/api';
import { fetchClient } from '@/api/fetchClient';
import { UpdateUserBody, User } from '@/api/auth/types';

export const getUser = async () => {
  return await fetchClient<User>(API_ROUTES.AUTH.USER);
};

export const updateUser = async (body: UpdateUserBody) => {
  return await fetchClient<User>(API_ROUTES.AUTH.USER, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};
