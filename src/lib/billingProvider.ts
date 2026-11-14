import type { BillingProvider } from '@/api/admin/subscriptions/types';

export const BILLING_PROVIDER_LABEL: Record<BillingProvider, string> = {
  stripe: 'Stripe',
  shopify: 'Shopify',
};
