'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createSubscriptionPlan, updateSubscriptionPlan } from '@/api/admin/subscriptions';
import {
  PLAN_FEATURES,
  PLAN_LIMITS,
  type PlanFeature,
  type PlanLimit,
  type PlanPayload,
  type SubscriptionPlan,
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
  plan?: SubscriptionPlan | null;
  onSaved: () => void;
}

interface FormInputs {
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  stripe_monthly_price_id: string;
  stripe_annual_price_id: string;
  limits: Record<PlanLimit, string>;
  features: Record<PlanFeature, boolean>;
}

const buildDefaults = (plan?: SubscriptionPlan | null): FormInputs => ({
  name: plan?.name ?? '',
  slug: plan?.slug ?? '',
  is_active: plan?.is_active ?? true,
  sort_order: plan?.sort_order ?? 0,
  stripe_monthly_price_id: plan?.stripe_monthly_price_id ?? '',
  stripe_annual_price_id: plan?.stripe_annual_price_id ?? '',
  limits: Object.fromEntries(
    PLAN_LIMITS.map((l) => [l, plan?.limits?.[l] != null ? String(plan.limits[l]) : '']),
  ) as Record<PlanLimit, string>,
  features: Object.fromEntries(
    PLAN_FEATURES.map((f) => [f, plan?.features?.[f] ?? false]),
  ) as Record<PlanFeature, boolean>,
});

export function PlanFormDialog({ open, onOpenChange, plan, onSaved }: Props) {
  const isEdit = !!plan;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({ defaultValues: buildDefaults(plan) });

  const features = watch('features');
  const isActive = watch('is_active');

  useEffect(() => {
    if (open) reset(buildDefaults(plan));
  }, [open, plan, reset]);

  const onSubmit = async (data: FormInputs) => {
    const limits: Partial<Record<PlanLimit, number>> = {};
    for (const key of PLAN_LIMITS) {
      const raw = data.limits[key];
      if (raw !== '' && raw != null) limits[key] = Number(raw);
    }

    const payload: PlanPayload = {
      name: data.name,
      slug: data.slug,
      is_active: data.is_active,
      sort_order: Number(data.sort_order) || 0,
      stripe_monthly_price_id: data.stripe_monthly_price_id || null,
      stripe_annual_price_id: data.stripe_annual_price_id || null,
      limits,
      features: data.features,
    };

    setSubmitting(true);
    try {
      if (isEdit && plan) {
        await updateSubscriptionPlan(plan.id, payload);
        toast.success('Plan updated.');
      } else {
        await createSubscriptionPlan(payload);
        toast.success('Plan created.');
      }
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save plan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>
            Stripe price IDs must be created in the Stripe Dashboard and pasted here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: 'Name is required.' })} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register('slug', { required: 'Slug is required.' })} />
              {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stripe_monthly_price_id">Stripe Monthly Price ID</Label>
              <Input id="stripe_monthly_price_id" placeholder="price_..." {...register('stripe_monthly_price_id')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stripe_annual_price_id">Stripe Annual Price ID</Label>
              <Input id="stripe_annual_price_id" placeholder="price_..." {...register('stripe_annual_price_id')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" min={0} {...register('sort_order', { valueAsNumber: true })} />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', !!checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Limits</Label>
            <p className="text-muted-foreground text-xs">Leave blank for unlimited.</p>
            <div className="grid grid-cols-2 gap-3">
              {PLAN_LIMITS.map((limit) => (
                <div key={limit} className="flex flex-col gap-1">
                  <Label htmlFor={`limit-${limit}`} className="text-xs font-normal">
                    {humanize(limit)}
                  </Label>
                  <Input
                    id={`limit-${limit}`}
                    type="number"
                    min={0}
                    placeholder="∞"
                    {...register(`limits.${limit}` as const)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-2">
              {PLAN_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={features[feature]}
                    onCheckedChange={(checked) => setValue(`features.${feature}`, !!checked)}
                  />
                  <Label htmlFor={`feature-${feature}`} className="text-sm font-normal">
                    {humanize(feature)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
