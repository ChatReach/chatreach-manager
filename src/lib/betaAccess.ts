import type { BetaAccessStatus } from '@/api/admin/tenants/types';

export const BETA_ACCESS_STATUS_BADGE: Record<
  BetaAccessStatus,
  { label: string; variant: 'outline' | 'secondary' | 'default' | 'destructive' }
> = {
  not_requested: { label: 'Not requested', variant: 'outline' },
  pending: { label: 'Pending', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  denied: { label: 'Denied', variant: 'destructive' },
};
