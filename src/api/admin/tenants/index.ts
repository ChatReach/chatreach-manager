import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type {
  CreateTenantPayload,
  Tenant,
  TenantBilling,
  TenantsResponse,
  UpdateBetaAccessPayload,
  UpdateTenantPayload,
} from './types';

export const getTenants = (params?: Record<string, string | number>) =>
  fetchClient<TenantsResponse>(API_ROUTES.ADMIN.TENANTS, { params });

export const getTenant = (id: string) =>
  fetchClient<Tenant>(API_ROUTES.ADMIN.TENANT(id));

export const getTenantBilling = (id: string) =>
  fetchClient<TenantBilling>(API_ROUTES.ADMIN.TENANT_BILLING(id));

export const createTenant = (data: CreateTenantPayload) =>
  fetchClient<Tenant>(API_ROUTES.ADMIN.TENANTS, { method: 'POST', body: JSON.stringify(data) });

export const updateTenant = (id: string, data: UpdateTenantPayload) =>
  fetchClient<Tenant>(API_ROUTES.ADMIN.TENANT(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const updateTenantBetaAccess =(id: string, data: UpdateBetaAccessPayload) =>
  fetchClient<Tenant>(API_ROUTES.ADMIN.TENANT_BETA_ACCESS(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
