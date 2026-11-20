'use client';

import type { Tenant } from '@/api/admin/tenants/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNow } from '@/hooks/use-now';
import { describeDuration, trialState } from '@/lib/trial';
import { formatDateTime } from '@/lib/utils';

interface Props {
  tenant: Tenant;
  onManage: () => void;
}

export function TrialSection({ tenant, onManage }: Props) {
  const now = useNow(30_000);
  const { endsAt, isActive, remainingMs } = trialState(tenant, now);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Trial</h3>
          {isActive ? (
            <Badge>Active</Badge>
          ) : endsAt ? (
            <Badge variant="outline">Ended</Badge>
          ) : (
            <Badge variant="outline">No trial</Badge>
          )}
          {tenant.trial_extended_at && <Badge variant="secondary">Extended</Badge>}
        </div>
        {!tenant.is_subscribed && (
          <Button variant="outline" size="sm" onClick={onManage}>
            Manage Trial
          </Button>
        )}
      </div>

      {endsAt && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {isActive ? 'Ends at' : 'Ended at'}
            </span>
            <span className="text-sm">{formatDateTime(endsAt)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {isActive ? 'Time left' : 'Ended'}
            </span>
            <span className="text-sm">
              {describeDuration(remainingMs)} {isActive ? 'left' : 'ago'}
            </span>
          </div>
          {tenant.trial_extended_at && (
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Extended at
              </span>
              <span className="text-sm">{formatDateTime(tenant.trial_extended_at)}</span>
            </div>
          )}
        </div>
      )}

      {tenant.is_subscribed && (
        <p className="text-muted-foreground text-sm">
          This workspace has an active subscription, which replaces the trial.
        </p>
      )}
    </div>
  );
}
