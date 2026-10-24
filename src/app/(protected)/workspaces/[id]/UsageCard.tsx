'use client';

import { useEffect, useState } from 'react';
import { getTenantUsage } from '@/api/admin/tenants';
import type { TenantLimitUsage, TenantUsage } from '@/api/admin/tenants/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { humanize } from '../../subscriptions/labels';

interface Props {
  tenantId: string;
}

function UsageRow({ label, usage }: { label: string; usage: TenantLimitUsage }) {
  const { limit, used } = usage;
  const isReached = limit !== null && used >= limit;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className={isReached ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          {used.toLocaleString()} / {limit === null ? 'unlimited' : limit.toLocaleString()}
        </span>
      </div>
      {limit !== null && (
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className={isReached ? 'bg-destructive h-full' : 'bg-primary h-full'}
            style={{ width: `${limit > 0 ? Math.min((used / limit) * 100, 100) : 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function UsageCard({ tenantId }: Props) {
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTenantUsage(tenantId)
      .then(setUsage)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load usage.'));
  }, [tenantId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Limits & usage</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : !usage ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            {!usage.has_plan && (
              <p className="text-muted-foreground text-sm">
                This workspace has no plan, so it can’t add anything that has a limit.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {Object.entries(usage.limits).map(([resource, limitUsage]) => (
                <UsageRow key={resource} label={humanize(resource)} usage={limitUsage} />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium">This month</h3>
                <span className="text-muted-foreground text-xs">
                  {formatDate(usage.monthly_period.starts_at)} – {formatDate(usage.monthly_period.resets_at)}
                </span>
              </div>
              {Object.entries(usage.monthly_limits).map(([resource, limitUsage]) => (
                <UsageRow key={resource} label={humanize(resource)} usage={limitUsage} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
