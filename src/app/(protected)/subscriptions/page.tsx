'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteSubscriptionAddon,
  deleteSubscriptionPlan,
  getSubscriptionPlans,
} from '@/api/admin/subscriptions';
import type { SubscriptionAddon, SubscriptionPlan } from '@/api/admin/subscriptions/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { APP_ROUTES } from '@/constants/routes';
import { AddonFormDialog } from './AddonFormDialog';
import { humanize } from './labels';

const formatEuros = (amount: number | null) =>
  amount === null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

function StripeLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return <span className="text-muted-foreground text-xs">{label}: —</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
    >
      {label} in Stripe
      <ExternalLink className="size-3" />
    </a>
  );
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [addonPlanId, setAddonPlanId] = useState<string>('');
  const [editingAddon, setEditingAddon] = useState<SubscriptionAddon | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getSubscriptionPlans()
      .then(setPlans)
      .catch((err) => setError(err.message ?? 'Failed to load plans.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateAddon = (planId: string) => {
    setAddonPlanId(planId);
    setEditingAddon(null);
    setAddonDialogOpen(true);
  };

  const openEditAddon = (planId: string, addon: SubscriptionAddon) => {
    setAddonPlanId(planId);
    setEditingAddon(addon);
    setAddonDialogOpen(true);
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Delete plan "${plan.name}" and all its addons?`)) return;
    try {
      await deleteSubscriptionPlan(plan.id);
      toast.success('Plan deleted.');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete plan.');
    }
  };

  const handleDeleteAddon = async (addon: SubscriptionAddon) => {
    if (!window.confirm(`Delete the ${humanize(addon.plan_limit)} addon?`)) return;
    try {
      await deleteSubscriptionAddon(addon.id);
      toast.success('Addon deleted.');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete addon.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Plans</h1>
          <p className="text-muted-foreground text-sm">Manage plans, addons and their Stripe prices.</p>
        </div>
        <Button asChild>
          <Link href={APP_ROUTES.SUBSCRIPTIONS_PLAN_NEW}>
            <Plus className="size-4" />
            Create Plan
          </Link>
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-muted-foreground text-sm">No plans yet. Create your first plan.</p>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <Badge variant="outline" className="font-mono text-xs">
                      {plan.slug}
                    </Badge>
                    {plan.is_active ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                    {plan.is_public ? (
                      <Badge variant="secondary">Public</Badge>
                    ) : (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span>{formatEuros(plan.monthly_price)} / mo</span>
                    <span>{formatEuros(plan.annual_price)} / yr</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <StripeLink label="Monthly" url={plan.stripe_monthly_url} />
                    <StripeLink label="Annual" url={plan.stripe_annual_url} />
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={APP_ROUTES.SUBSCRIPTIONS_PLAN_EDIT(plan.id)}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePlan(plan)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {Object.keys(plan.limits).length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">Limits</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(plan.limits).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {humanize(key)}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.entries(plan.features).some(([, v]) => v) && (
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">Features</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(plan.features)
                          .filter(([, v]) => v)
                          .map(([key]) => (
                            <Badge key={key} variant="secondary">
                              {humanize(key)}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Addons</h3>
                    <Button variant="outline" size="sm" onClick={() => openCreateAddon(plan.id)}>
                      <Plus className="size-4" />
                      Add Addon
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Limit</TableHead>
                          <TableHead className="text-right">Per Unit</TableHead>
                          <TableHead className="text-right">Max</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Stripe</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.addons.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-muted-foreground text-center text-sm">
                              No addons.
                            </TableCell>
                          </TableRow>
                        ) : (
                          plan.addons.map((addon) => (
                            <TableRow key={addon.id}>
                              <TableCell className="font-medium">{humanize(addon.plan_limit)}</TableCell>
                              <TableCell className="text-right">{addon.amount_per_unit}</TableCell>
                              <TableCell className="text-right">{addon.max_quantity}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                <div className="flex flex-col">
                                  <span>{formatEuros(addon.monthly_price)} / mo</span>
                                  <span>{formatEuros(addon.annual_price)} / yr</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {addon.is_active ? (
                                  <Badge variant="secondary">Active</Badge>
                                ) : (
                                  <Badge variant="outline">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <StripeLink label="Monthly" url={addon.stripe_monthly_url} />
                                  <StripeLink label="Annual" url={addon.stripe_annual_url} />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => openEditAddon(plan.id, addon)}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleDeleteAddon(addon)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {addonPlanId && (
        <AddonFormDialog
          open={addonDialogOpen}
          onOpenChange={setAddonDialogOpen}
          planId={addonPlanId}
          addon={editingAddon}
          onSaved={load}
        />
      )}
    </div>
  );
}
