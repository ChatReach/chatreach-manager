import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type { WebhookCall, WebhookCallHeaders, WebhookCallsResponse } from './types';

export const getWebhookCalls = (params?: Record<string, string | number>) =>
  fetchClient<WebhookCallsResponse>(API_ROUTES.ADMIN.WEBHOOK_CALLS, { params });

export const getWebhookCall = (id: string) =>
  fetchClient<WebhookCall>(API_ROUTES.ADMIN.WEBHOOK_CALL(id));

export const getWebhookCallHeaders = (id: string) =>
  fetchClient<WebhookCallHeaders>(API_ROUTES.ADMIN.WEBHOOK_CALL_HEADERS(id));
