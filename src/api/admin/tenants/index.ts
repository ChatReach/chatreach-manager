import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type { CreateTenantPayload, Tenant, TenantsResponse } from './types';

export const getTenants = (params?: Record<string, string | number>) =>
  fetchClient<TenantsResponse>(API_ROUTES.ADMIN.TENANTS, { params });

export const getTenant = (id: string) =>
  fetchClient<Tenant>(API_ROUTES.ADMIN.TENANT(id));

export const createTenant = (data: CreateTenantPayload) =>
  fetchClient<Tenant>(API_ROUTES.ADMIN.TENANTS, { method: 'POST', body: JSON.stringify(data) });
