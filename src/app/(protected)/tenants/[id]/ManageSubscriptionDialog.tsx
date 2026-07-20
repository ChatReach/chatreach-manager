'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  addTenantAddon,
  cancelTenantSubscription,
  getSubscriptionPlans,
  getTenantSubscription,
  removeTenantAddon,
  resumeTenantSubscription,
  swapTenantSubscription,
} from '@/api/admin/subscriptions';
import type {
  BillingInterval,
  PlanLimit,
  SubscriptionPlan,
  TenantSubscriptionState,
} from '@/api/admin/subscriptions/types';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { humanize } from '../../subscriptions/labels';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onChanged: () => void;
}

const selectClass =
  'border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none';

export function ManageSubscriptionDialog({ open, onOpenChange, tenantId, onChanged }: Props) {
  const [state, setState] = useState<TenantSubscriptionState | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly');
  const [addonDeltas, setAddonDeltas] = useState<Record<string, number>>({});

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getTenantSubscription(tenantId), getSubscriptionPlans()])
      .then(([sub, planList]) => {
        setState(sub);
        setPlans(planList);
        if (sub.subscription?.plan) setSelectedPlan(sub.subscription.plan.slug);
        else if (planList[0]) setSelectedPlan(planList[0].slug);
        if (sub.subscription?.interval) setSelectedInterval(sub.subscription.interval);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load subscription.'))
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      load();
      onChanged();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const activePlan = plans.find((p) => p.slug === state?.subscription?.plan?.slug);
  const activeAddons = activePlan?.addons.filter((a) => a.is_active) ?? [];

  const currentQuantity = (limit: PlanLimit) =>
    state?.subscription?.addons.find((a) => a.plan_limit === limit)?.quantity ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            Change the plan, interval, addons, or cancellation state for this tenant.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-24" />
          </div>
        ) : !state?.subscribed ? (
          <p className="text-muted-foreground text-sm">
            This tenant has no active Stripe subscription. Plan changes can only be made once the tenant
            has subscribed.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current:</span>
              {state.subscription?.plan ? (
                <Badge variant="secondary" className="capitalize">
                  {state.subscription.plan.name}
                </Badge>
              ) : (
                <span>—</span>
              )}
              {state.subscription?.interval && <Badge variant="outline">{state.subscription.interval}</Badge>}
              {state.canceled && <Badge variant="destructive">Canceled</Badge>}
              {state.on_grace_period && <Badge variant="outline">Grace period</Badge>}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Change Plan</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="swap-plan">Plan</Label>
                  <select
                    id="swap-plan"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className={selectClass}
                  >
                    {plans
                      .filter((p) => p.is_active)
                      .map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="swap-interval">Interval</Label>
                  <select
                    id="swap-interval"
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value as BillingInterval)}
                    className={selectClass}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <Button
                className="w-fit"
                disabled={busy}
                onClick={() =>
                  run(
                    () => swapTenantSubscription(tenantId, { plan: selectedPlan, interval: selectedInterval }),
                    'Plan swapped.',
                  )
                }
              >
                Swap Plan
              </Button>
            </div>

            {activeAddons.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium">Addons</h3>
                  {activeAddons.map((addon) => {
                    const key = addon.plan_limit;
                    const delta = addonDeltas[key] ?? 1;
                    return (
                      <div key={addon.id} className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-medium">{humanize(addon.plan_limit)}</span>
                          <span className="text-muted-foreground">
                            {' '}
                            — current {currentQuantity(addon.plan_limit)} / max {addon.max_quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={delta}
                            onChange={(e) =>
                              setAddonDeltas((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                            }
                            className="w-20"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              run(
                                () => addTenantAddon(tenantId, { type: addon.plan_limit, quantity: delta }),
                                'Addon added.',
                              )
                            }
                          >
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              run(
                                () => removeTenantAddon(tenantId, { type: addon.plan_limit, quantity: delta }),
                                'Addon removed.',
                              )
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <Separator />
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Subscription State</h3>
              {state.on_grace_period || state.canceled ? (
                <Button
                  variant="outline"
                  className="w-fit"
                  disabled={busy}
                  onClick={() => run(() => resumeTenantSubscription(tenantId), 'Subscription resumed.')}
                >
                  Resume Subscription
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-fit"
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm('Cancel this tenant’s subscription?')) return;
                    run(() => cancelTenantSubscription(tenantId), 'Subscription canceled.');
                  }}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
