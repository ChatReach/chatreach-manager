'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createSubscriptionAddon, updateSubscriptionAddon } from '@/api/admin/subscriptions';
import {
  PLAN_LIMITS,
  type AddonPayload,
  type PlanLimit,
  type SubscriptionAddon,
} from '@/api/admin/subscriptions/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { humanize } from './labels';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  addon?: SubscriptionAddon | null;
  onSaved: () => void;
}

interface FormInputs {
  plan_limit: PlanLimit;
  amount_per_unit: number;
  max_quantity: number;
  is_active: boolean;
  monthly_price: string;
  annual_price: string;
  stripe_monthly_price_id: string;
  stripe_annual_price_id: string;
}

const buildDefaults = (addon?: SubscriptionAddon | null): FormInputs => ({
  plan_limit: addon?.plan_limit ?? PLAN_LIMITS[0],
  amount_per_unit: addon?.amount_per_unit ?? 1,
  max_quantity: addon?.max_quantity ?? 1,
  is_active: addon?.is_active ?? true,
  monthly_price: addon?.monthly_price != null ? String(addon.monthly_price) : '',
  annual_price: addon?.annual_price != null ? String(addon.annual_price) : '',
  stripe_monthly_price_id: addon?.stripe_monthly_price_id ?? '',
  stripe_annual_price_id: addon?.stripe_annual_price_id ?? '',
});

export function AddonFormDialog({ open, onOpenChange, planId, addon, onSaved }: Props) {
  const isEdit = !!addon;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({ defaultValues: buildDefaults(addon) });

  const planLimit = watch('plan_limit');
  const isActive = watch('is_active');

  useEffect(() => {
    if (open) reset(buildDefaults(addon));
  }, [open, addon, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload: AddonPayload = {
      plan_limit: data.plan_limit,
      amount_per_unit: Number(data.amount_per_unit),
      max_quantity: Number(data.max_quantity),
      is_active: data.is_active,
      monthly_price: data.monthly_price !== '' ? Number(data.monthly_price) : null,
      annual_price: data.annual_price !== '' ? Number(data.annual_price) : null,
      stripe_monthly_price_id: data.stripe_monthly_price_id || null,
      stripe_annual_price_id: data.stripe_annual_price_id || null,
    };

    setSubmitting(true);
    try {
      if (isEdit && addon) {
        await updateSubscriptionAddon(addon.id, payload);
        toast.success('Addon updated.');
      } else {
        await createSubscriptionAddon(planId, payload);
        toast.success('Addon created.');
      }
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save addon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Addon' : 'Add Addon'}</DialogTitle>
          <DialogDescription>
            Addons increase a plan limit. Paste the matching Stripe price IDs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan_limit">Limit</Label>
            <select
              id="plan_limit"
              value={planLimit}
              onChange={(e) => setValue('plan_limit', e.target.value as PlanLimit)}
              className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              {PLAN_LIMITS.map((limit) => (
                <option key={limit} value={limit}>
                  {humanize(limit)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount_per_unit">Amount per Unit</Label>
              <Input
                id="amount_per_unit"
                type="number"
                min={1}
                {...register('amount_per_unit', { valueAsNumber: true, required: true, min: 1 })}
              />
              {errors.amount_per_unit && <p className="text-destructive text-xs">Must be at least 1.</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="max_quantity">Max Quantity</Label>
              <Input
                id="max_quantity"
                type="number"
                min={1}
                {...register('max_quantity', { valueAsNumber: true, required: true, min: 1 })}
              />
              {errors.max_quantity && <p className="text-destructive text-xs">Must be at least 1.</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addon_monthly_price">Monthly Price (EUR)</Label>
              <Input
                id="addon_monthly_price"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 20"
                {...register('monthly_price')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addon_annual_price">Annual Price (EUR)</Label>
              <Input
                id="addon_annual_price"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 200"
                {...register('annual_price')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addon_stripe_monthly">Stripe Monthly Price ID</Label>
            <Input id="addon_stripe_monthly" placeholder="price_..." {...register('stripe_monthly_price_id')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addon_stripe_annual">Stripe Annual Price ID</Label>
            <Input id="addon_stripe_annual" placeholder="price_..." {...register('stripe_annual_price_id')} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="addon_is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', !!checked)}
            />
            <Label htmlFor="addon_is_active">Active</Label>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Addon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
