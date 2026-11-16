'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  addTenantAddon,
  cancelTenantSubscription,
  getSharedAddons,
  getSubscriptionPlans,
  getTenantSubscription,
  removeTenantAddon,
  resumeTenantSubscription,
  startTenantSubscription,
  swapTenantSubscription,
  switchTenantToStripe,
} from '@/api/admin/subscriptions';
import type {
  AddonType,
  BillingInterval,
  SubscriptionAddon,
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
import { BILLING_PROVIDER_LABEL } from '@/lib/billingProvider';
import { formatDate } from '@/lib/utils';
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
  const [sharedAddons, setSharedAddons] = useState<SubscriptionAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly');
  const [addonDeltas, setAddonDeltas] = useState<Record<string, number>>({});
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getTenantSubscription(tenantId), getSubscriptionPlans(), getSharedAddons()])
      .then(([sub, planList, sharedAddonList]) => {
        setState(sub);
        setPlans(planList);
        setSharedAddons(sharedAddonList);
        if (sub.subscription?.plan) setSelectedPlan(sub.subscription.plan.slug);
        else if (planList[0]) setSelectedPlan(planList[0].slug);
        if (sub.subscription?.interval) setSelectedInterval(sub.subscription.interval);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load subscription.'))
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(() => {
    if (open) {
      setCheckoutUrl(null);
      load();
    }
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
  const activeAddons = [...(activePlan?.addons ?? []), ...sharedAddons].filter((a) => a.is_active);

  const currentQuantity = (type: AddonType) =>
    state?.subscription?.addons.find((a) => a.type === type)?.quantity ?? 0;

  const startSubscription = async () => {
    setBusy(true);
    try {
      const { url } = await startTenantSubscription(tenantId, {
        plan: selectedPlan,
        interval: selectedInterval,
      });
      if (!url) {
        toast.success('Plan activated.');
        load();
        onChanged();
        return;
      }

      setCheckoutUrl(url);
      toast.success('Checkout link generated.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start subscription.');
    } finally {
      setBusy(false);
    }
  };

  const switchToStripe = async () => {
    if (
      !window.confirm(
        'Switch this workspace to Stripe billing? Its Shopify subscription is canceled now and Shopify refunds the unused part. Shopify billing stays off for this store from now on.',
      )
    )
      return;

    setBusy(true);
    try {
      const { url } = await switchTenantToStripe(tenantId, {
        plan: selectedPlan,
        interval: selectedInterval,
      });
      load();
      onChanged();

      if (!url) {
        toast.success('Switched to Stripe and plan activated.');
        return;
      }

      setCheckoutUrl(url);
      toast.success('Switched to Stripe. Checkout link generated.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch to Stripe.');
    } finally {
      setBusy(false);
    }
  };

  // Moving off a free plan needs payment details, so the API hands back a Checkout link instead of swapping.
  const swapPlan = async () => {
    setBusy(true);
    try {
      const result = await swapTenantSubscription(tenantId, { plan: selectedPlan, interval: selectedInterval });

      if (result?.url) {
        setCheckoutUrl(result.url);
        toast.success('Checkout link generated.');
        return;
      }

      toast.success('Plan swapped.');
      load();
      onChanged();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to swap plan.');
    } finally {
      setBusy(false);
    }
  };

  const checkoutLink = checkoutUrl && (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <p className="text-muted-foreground text-sm">
        Share this link with the workspace to complete payment. The subscription activates once they check out.
      </p>
      <p className="text-xs break-all">{checkoutUrl}</p>
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          navigator.clipboard.writeText(checkoutUrl);
          toast.success('Link copied.');
        }}
      >
        Copy Link
      </Button>
    </div>
  );

  const planIntervalFields = (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="plan">Plan</Label>
        <select
          id="plan"
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
        <Label htmlFor="interval">Interval</Label>
        <select
          id="interval"
          value={selectedInterval}
          onChange={(e) => setSelectedInterval(e.target.value as BillingInterval)}
          className={selectClass}
        >
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
    </div>
  );

  const subscription = state?.subscription ?? null;
  const isShopifyBilled = state?.billing_provider === 'shopify';
  const isShopifySubscription = subscription?.billing_provider === 'shopify';
  const shopifyManageUrl = subscription?.shopify_manage_billing_url ?? null;

  const currentSummary = (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Current:</span>
      {subscription?.plan ? (
        <Badge variant="secondary" className="capitalize">
          {subscription.plan.name}
        </Badge>
      ) : (
        <span>—</span>
      )}
      {subscription?.interval && <Badge variant="outline">{subscription.interval}</Badge>}
      {subscription && <Badge variant="outline">{BILLING_PROVIDER_LABEL[subscription.billing_provider]}</Badge>}
      {state?.canceled && <Badge variant="destructive">Canceled</Badge>}
      {state?.on_grace_period && <Badge variant="outline">Grace period</Badge>}
    </div>
  );

  const shopifyView = (
    <div className="flex flex-col gap-5">
      {subscription && isShopifySubscription && state?.subscribed ? (
        <div className="flex flex-col gap-3">
          {currentSummary}
          <div className="grid gap-1 text-sm">
            {state.shopify_shop && (
              <p>
                <span className="text-muted-foreground">Shopify store:</span> {state.shopify_shop}
              </p>
            )}
            {subscription.price !== null && (
              <p>
                <span className="text-muted-foreground">Price:</span> {subscription.price} / {subscription.interval === 'annual' ? 'year' : 'month'}
              </p>
            )}
            {subscription.next_charge_at && (
              <p>
                <span className="text-muted-foreground">Next charge:</span> {formatDate(subscription.next_charge_at)}
              </p>
            )}
            {subscription.ends_at && (
              <p>
                <span className="text-muted-foreground">Access ends:</span> {formatDate(subscription.ends_at)}
              </p>
            )}
          </div>
          {isShopifyBilled && (
            <Button
              variant="destructive"
              size="sm"
              className="w-fit"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    'Cancel this workspace’s Shopify subscription? Access ends now and Shopify refunds the unused part.',
                  )
                )
                  return;
                run(() => cancelTenantSubscription(tenantId), 'Shopify subscription canceled.');
              }}
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          This workspace has no active Shopify subscription
          {state?.shopify_shop ? ` for ${state.shopify_shop}` : ''}
          {state?.on_trial ? ' and is currently on trial' : ''}.
        </p>
      )}

      {isShopifyBilled ? (
        <>
          <div className="flex flex-col gap-2 rounded-md border p-3">
            <p className="text-muted-foreground text-sm">
              This workspace is billed through Shopify. Its plan can only be changed by the merchant from their
              Shopify admin. Send them this link to the plan page:
            </p>
            {shopifyManageUrl ? (
              <>
                <p className="text-xs break-all">{shopifyManageUrl}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    navigator.clipboard.writeText(shopifyManageUrl);
                    toast.success('Link copied.');
                  }}
                >
                  Copy Link
                </Button>
              </>
            ) : (
              <p className="text-xs">No Shopify store is connected, so there is no plan page to link to.</p>
            )}
          </div>

          <Separator />
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Switch to Stripe</h3>
            <p className="text-muted-foreground text-sm">
              Moves this workspace to Stripe billing and generates a Stripe Checkout link for the chosen plan. The
              current Shopify subscription is canceled now, with a prorated refund from Shopify.
            </p>
            {planIntervalFields}
            <Button className="w-fit" disabled={busy || !selectedPlan} onClick={switchToStripe}>
              Switch to Stripe
            </Button>
            {checkoutLink}
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            This workspace now bills through Stripe
            {subscription?.ends_at ? `; its Shopify access ends on ${formatDate(subscription.ends_at)}` : ''}. Generate
            a Stripe Checkout link for the plan it should continue on.
          </p>
          {planIntervalFields}
          <Button className="w-fit" disabled={busy || !selectedPlan} onClick={startSubscription}>
            Start Subscription
          </Button>
          {checkoutLink}
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            {isShopifyBilled || isShopifySubscription
              ? 'This workspace is on a Shopify subscription. Only the merchant can change its plan.'
              : 'Change the plan, interval, addons, or cancellation state for this workspace.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-24" />
          </div>
        ) : isShopifyBilled || isShopifySubscription ? (
          shopifyView
        ) : !state?.subscribed ? (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              This workspace has no active Stripe subscription
              {state?.on_trial ? ' and is currently on trial' : ''}. Pick a plan to generate a Stripe Checkout
              link the workspace can use to subscribe. Free plans are activated right away, without Checkout.
            </p>
            {planIntervalFields}
            <Button className="w-fit" disabled={busy || !selectedPlan} onClick={startSubscription}>
              Start Subscription
            </Button>
            {checkoutLink}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {currentSummary}

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Change Plan</h3>
              {planIntervalFields}
              <Button
                className="w-fit"
                disabled={busy}
                onClick={swapPlan}
              >
                Swap Plan
              </Button>
              {checkoutLink}
            </div>

            {activeAddons.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium">Addons</h3>
                  {activeAddons.map((addon) => {
                    const key = addon.type;
                    const isFeature = addon.plan_feature !== null;
                    // A feature addon is a toggle, so it is added and removed without a quantity.
                    const delta = isFeature ? undefined : (addonDeltas[key] ?? 1);
                    const isActive = currentQuantity(key) > 0;

                    return (
                      <div key={addon.id} className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-medium">{humanize(key)}</span>
                          <span className="text-muted-foreground">
                            {' '}
                            {isFeature
                              ? `— ${isActive ? 'active' : 'not active'}`
                              : `— current ${currentQuantity(key)} / max ${addon.max_quantity}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isFeature && (
                            <Input
                              type="number"
                              min={1}
                              value={delta}
                              onChange={(e) =>
                                setAddonDeltas((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                              }
                              className="w-20"
                            />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy || (isFeature && isActive)}
                            onClick={() =>
                              run(
                                () => addTenantAddon(tenantId, { type: key, quantity: delta }),
                                'Addon added.',
                              )
                            }
                          >
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy || (isFeature && !isActive)}
                            onClick={() =>
                              run(
                                () => removeTenantAddon(tenantId, { type: key, quantity: delta }),
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
                    if (!window.confirm('Cancel this workspace’s subscription?')) return;
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
