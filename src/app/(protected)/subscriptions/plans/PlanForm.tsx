'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { APP_ROUTES } from '@/constants/routes';
import { humanize } from '../labels';

interface Props {
  plan?: SubscriptionPlan | null;
}

interface FormInputs {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  is_public: boolean;
  is_popular: boolean;
  is_trial: boolean;
  sort_order: number;
  monthly_price: string;
  annual_price: string;
  stripe_monthly_price_id: string;
  stripe_annual_price_id: string;
  shopify_plan_handle: string;
  limits: Record<PlanLimit, string>;
  features: Record<PlanFeature, boolean>;
}

const buildDefaults = (plan?: SubscriptionPlan | null): FormInputs => ({
  name: plan?.name ?? '',
  slug: plan?.slug ?? '',
  description: plan?.description ?? '',
  is_active: plan?.is_active ?? true,
  is_public: plan?.is_public ?? true,
  is_popular: plan?.is_popular ?? false,
  is_trial: plan?.is_trial ?? false,
  sort_order: plan?.sort_order ?? 0,
  monthly_price: plan?.monthly_price != null ? String(plan.monthly_price) : '',
  annual_price: plan?.annual_price != null ? String(plan.annual_price) : '',
  stripe_monthly_price_id: plan?.stripe_monthly_price_id ?? '',
  stripe_annual_price_id: plan?.stripe_annual_price_id ?? '',
  shopify_plan_handle: plan?.shopify_plan_handle ?? '',
  limits: Object.fromEntries(
    PLAN_LIMITS.map((l) => [l, plan?.limits?.[l] != null ? String(plan.limits[l]) : '']),
  ) as Record<PlanLimit, string>,
  features: Object.fromEntries(
    PLAN_FEATURES.map((f) => [f, plan?.features?.[f] ?? false]),
  ) as Record<PlanFeature, boolean>,
});

export function PlanForm({ plan }: Props) {
  const router = useRouter();
  const isEdit = !!plan;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormInputs>({ defaultValues: buildDefaults(plan) });

  const features = watch('features');
  const isActive = watch('is_active');
  const isPublic = watch('is_public');
  const isPopular = watch('is_popular');
  const isTrial = watch('is_trial');

  const onSubmit = async (data: FormInputs) => {
    const limits: Partial<Record<PlanLimit, number>> = {};
    for (const key of PLAN_LIMITS) {
      const raw = data.limits[key];
      if (raw !== '' && raw != null) limits[key] = Number(raw);
    }

    const payload: PlanPayload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      is_active: data.is_active,
      is_public: data.is_public,
      is_popular: data.is_popular,
      is_trial: data.is_trial,
      sort_order: Number(data.sort_order) || 0,
      monthly_price: data.monthly_price !== '' ? Number(data.monthly_price) : null,
      annual_price: data.annual_price !== '' ? Number(data.annual_price) : null,
      stripe_monthly_price_id: data.stripe_monthly_price_id || null,
      stripe_annual_price_id: data.stripe_annual_price_id || null,
      shopify_plan_handle: data.shopify_plan_handle || null,
      limits,
      features: data.features,
    };

    try {
      if (isEdit && plan) {
        await updateSubscriptionPlan(plan.id, payload);
        toast.success('Plan updated.');
      } else {
        await createSubscriptionPlan(payload);
        toast.success('Plan created.');
      }
      router.push(APP_ROUTES.SUBSCRIPTIONS);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save plan.');
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={APP_ROUTES.SUBSCRIPTIONS}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Plan' : 'Create Plan'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure the plan details, pricing, limits and features.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                placeholder="e.g. Everything you need to grow."
                {...register('description')}
              />
              <p className="text-muted-foreground text-xs">
                Shown under the plan name on the customer plan picker.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('sort_order', { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-end gap-4 pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', !!checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setValue('is_public', !!checked)}
                  />
                  <Label htmlFor="is_public">Public</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_popular"
                  checked={isPopular}
                  onCheckedChange={(checked) => setValue('is_popular', !!checked)}
                />
                <Label htmlFor="is_popular">Most popular</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_trial"
                  checked={isTrial}
                  onCheckedChange={(checked) => setValue('is_trial', !!checked)}
                />
                <Label htmlFor="is_trial">Trial plan</Label>
              </div>
            </div>

            <p className="text-muted-foreground text-xs">
              Private plans stay usable for workspaces already on them, but are hidden from the plan picker. Only
              one plan can be the most popular plan and one can be the trial plan &mdash; checking either here
              unsets it on the plan that had it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="monthly_price">Monthly Price (EUR)</Label>
                <Input
                  id="monthly_price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 69"
                  {...register('monthly_price')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="annual_price">Annual Price (EUR)</Label>
                <Input
                  id="annual_price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 690"
                  {...register('annual_price')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="stripe_monthly_price_id">Stripe Monthly Price ID</Label>
                  <Input
                    id="stripe_monthly_price_id"
                    placeholder="price_..."
                    {...register('stripe_monthly_price_id')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="stripe_annual_price_id">Stripe Annual Price ID</Label>
                  <Input
                    id="stripe_annual_price_id"
                    placeholder="price_..."
                    {...register('stripe_annual_price_id')}
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                The Stripe prices charged when a workspace subscribes to this plan. Create them in the Stripe
                Dashboard and paste the IDs here.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shopify_plan_handle">Shopify Plan Handle</Label>
              <Input
                id="shopify_plan_handle"
                placeholder="e.g. grow"
                {...register('shopify_plan_handle')}
              />
              <p className="text-muted-foreground text-xs">
                The Shopify App Pricing plan handle used to match Shopify-billed subscriptions to this plan.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Limits</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild type="button" variant="outline">
            <Link href={APP_ROUTES.SUBSCRIPTIONS}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
