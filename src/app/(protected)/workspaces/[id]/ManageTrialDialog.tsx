'use client';

import { useEffect, useState } from 'react';
import { addDays, format, max } from 'date-fns';
import { toast } from 'sonner';
import { endTenantTrial, updateTenantTrial } from '@/api/admin/tenants';
import type { Tenant } from '@/api/admin/tenants/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNow } from '@/hooks/use-now';
import { describeDuration, trialState } from '@/lib/trial';
import { formatDateTime } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant;
  onChanged: () => void;
}

const EXTEND_DAYS = [1, 7, 14, 30];

export function ManageTrialDialog({ open, onOpenChange, tenant, onChanged }: Props) {
  const now = useNow(30_000);
  const [busy, setBusy] = useState(false);
  const [customEnd, setCustomEnd] = useState('');
  const { endsAt, isActive, remainingMs } = trialState(tenant, now);

  useEffect(() => {
    if (open) setCustomEnd('');
  }, [open]);

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      onChanged();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update the trial.');
    } finally {
      setBusy(false);
    }
  };

  const setEnd = (next: Date) =>
    run(() => updateTenantTrial(tenant.id, next.toISOString()), `Trial now ends ${formatDateTime(next)}.`);

  // An ended trial restarts from now, so it always gets the full number of days.
  const extendBy = (days: number) => setEnd(addDays(isActive && endsAt ? max([endsAt, now]) : now, days));

  const endNow = () => {
    if (!window.confirm('End this workspace’s trial now? It loses access until it subscribes.')) return;
    run(() => endTenantTrial(tenant.id), 'Trial ended.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Trial</DialogTitle>
          <DialogDescription>
            {isActive && endsAt
              ? `Ends ${formatDateTime(endsAt)}, ${describeDuration(remainingMs)} left.`
              : endsAt
                ? `Ended ${formatDateTime(endsAt)}. Extending starts a new trial from now.`
                : 'This workspace has no trial. Extending starts one from now.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{isActive ? 'Extend by' : 'Start a trial of'}</span>
            <div className="flex flex-wrap gap-2">
              {EXTEND_DAYS.map((days) => (
                <Button key={days} variant="outline" size="sm" disabled={busy} onClick={() => extendBy(days)}>
                  +{days} {days === 1 ? 'day' : 'days'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trial-ends-at">Or set the end</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="trial-ends-at"
                type="datetime-local"
                className="w-fit"
                min={format(now, "yyyy-MM-dd'T'HH:mm")}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <Button size="sm" disabled={busy || !customEnd} onClick={() => setEnd(new Date(customEnd))}>
                Save
              </Button>
            </div>
          </div>

          {isActive && (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">End trial</span>
                <p className="text-muted-foreground text-sm">
                  The workspace loses access right away, until it subscribes.
                </p>
                <Button variant="destructive" size="sm" className="w-fit" disabled={busy} onClick={endNow}>
                  End Trial Now
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
