import type { Tenant } from '@/api/admin/tenants/types';

export function describeDuration(ms: number): string {
  const minutes = Math.floor(Math.abs(ms) / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

  if (days > 0) return [plural(days, 'day'), hours > 0 && plural(hours, 'hour')].filter(Boolean).join(', ');
  if (hours > 0) return [plural(hours, 'hour'), mins > 0 && plural(mins, 'minute')].filter(Boolean).join(', ');

  return mins > 0 ? plural(mins, 'minute') : 'less than a minute';
}

export function trialState(tenant: Tenant, now: Date) {
  const endsAt = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;

  return {
    endsAt,
    isActive: tenant.is_on_trial && endsAt !== null && endsAt > now,
    remainingMs: endsAt ? endsAt.getTime() - now.getTime() : 0,
  };
}
