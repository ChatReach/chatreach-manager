'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateTenantBetaAccess } from '@/api/admin/tenants';
import type { BetaAccessStatus } from '@/api/admin/tenants/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BETA_ACCESS_STATUS_BADGE } from '@/lib/betaAccess';
import { formatDateTime } from '@/lib/utils';

interface Props {
  tenantId: string;
  status: BetaAccessStatus;
  requestedAt: string | null;
  onChanged: () => void;
}

export function BetaAccessCard({ tenantId, status, requestedAt, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const badge = BETA_ACCESS_STATUS_BADGE[status];

  const updateStatus = async (nextStatus: 'approved' | 'denied') => {
    setBusy(true);
    try {
      await updateTenantBetaAccess(tenantId, { status: nextStatus });
      toast.success(nextStatus === 'approved' ? 'Beta access approved.' : 'Beta access denied.');
      onChanged();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update beta access.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Beta Access</CardTitle>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Requested
          </span>
          <span className="text-sm">
            {requestedAt ? formatDateTime(requestedAt) : <span className="text-muted-foreground">—</span>}
          </span>
        </div>

        {(status === 'pending' || status === 'not_requested' || status === 'denied') && (
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => updateStatus('approved')}>
              Approve
            </Button>
            {status !== 'denied' && (
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => updateStatus('denied')}
              >
                Deny
              </Button>
            )}
          </div>
        )}

        {status === 'approved' && (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => updateStatus('denied')}>
              Revoke Access
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
