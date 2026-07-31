import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type {
  AddonPayload,
  AddonQuantityPayload,
  PlanPayload,
  SubscriptionAddon,
  StartSubscriptionResponse,
  SubscriptionPlan,
  SwapPayload,
  TenantSubscriptionState,
} from './types';

export const getSubscriptionPlans = () =>
  fetchClient<SubscriptionPlan[]>(API_ROUTES.ADMIN.SUBSCRIPTION_PLANS);

export const createSubscriptionPlan = (data: PlanPayload) =>
  fetchClient<SubscriptionPlan>(API_ROUTES.ADMIN.SUBSCRIPTION_PLANS, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSubscriptionPlan = (id: string, data: Partial<PlanPayload>) =>
  fetchClient<SubscriptionPlan>(API_ROUTES.ADMIN.SUBSCRIPTION_PLAN(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSubscriptionPlan = (id: string) =>
  fetchClient<void>(API_ROUTES.ADMIN.SUBSCRIPTION_PLAN(id), { method: 'DELETE' });

export const createSubscriptionAddon = (planId: string, data: AddonPayload) =>
  fetchClient<SubscriptionAddon>(API_ROUTES.ADMIN.SUBSCRIPTION_PLAN_ADDONS(planId), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSubscriptionAddon = (id: string, data: Partial<AddonPayload>) =>
  fetchClient<SubscriptionAddon>(API_ROUTES.ADMIN.SUBSCRIPTION_ADDON(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSubscriptionAddon = (id: string) =>
  fetchClient<void>(API_ROUTES.ADMIN.SUBSCRIPTION_ADDON(id), { method: 'DELETE' });

export const getTenantSubscription = (tenantId: string) =>
  fetchClient<TenantSubscriptionState>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION(tenantId));

export const startTenantSubscription = (tenantId: string, data: SwapPayload) =>
  fetchClient<StartSubscriptionResponse>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION(tenantId), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const swapTenantSubscription = (tenantId: string, data: SwapPayload) =>
  fetchClient<void>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION_SWAP(tenantId), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const cancelTenantSubscription = (tenantId: string) =>
  fetchClient<void>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION_CANCEL(tenantId), { method: 'POST' });

export const resumeTenantSubscription = (tenantId: string) =>
  fetchClient<void>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION_RESUME(tenantId), { method: 'POST' });

export const addTenantAddon = (tenantId: string, data: AddonQuantityPayload) =>
  fetchClient<void>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION_ADDONS(tenantId), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const removeTenantAddon = (tenantId: string, data: AddonQuantityPayload) =>
  fetchClient<void>(API_ROUTES.ADMIN.TENANT_SUBSCRIPTION_ADDONS(tenantId), {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
