'use client';

import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateTenant } from '@/api/admin/tenants';
import type { BillingAddress, Tenant, UpdateTenantPayload } from '@/api/admin/tenants/types';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { VALIDATION_REGEX } from '@/constants/validation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant;
  onChanged: () => void;
}

type Inputs = {
  name: string;
  billing_name: string;
  billing_email: string;
  billing_phone_number: string;
  monthly_spending_limit: string;
  line1: string;
  line2: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
};

const addressFields = ['line1', 'line2', 'postal_code', 'city', 'state', 'country'] as const;

export function EditWorkspaceDialog({ open, onOpenChange, tenant, onChanged }: Props) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<Inputs>();

  useEffect(() => {
    if (!open) return;

    const address = tenant.billing_address;

    reset({
      name: tenant.name,
      billing_name: tenant.billing_name ?? '',
      billing_email: tenant.billing_email ?? '',
      billing_phone_number: tenant.billing_phone_number ?? '',
      monthly_spending_limit:
        tenant.monthly_spending_limit != null ? String(tenant.monthly_spending_limit) : '',
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      postal_code: address?.postal_code ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      country: address?.country ?? '',
    });
  }, [open, tenant, reset]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const payload: UpdateTenantPayload = {
      ...(data.name !== tenant.name && { name: data.name }),
      ...(data.billing_name !== (tenant.billing_name ?? '') && {
        billing_name: data.billing_name || null,
      }),
      ...(data.billing_email !== (tenant.billing_email ?? '') && {
        billing_email: data.billing_email || null,
      }),
      ...(data.billing_phone_number !== (tenant.billing_phone_number ?? '') && {
        billing_phone_number: data.billing_phone_number || null,
      }),
    };

    const limit = data.monthly_spending_limit.trim();
    const nextLimit = limit === '' ? null : Number(limit);
    if (nextLimit !== (tenant.monthly_spending_limit ?? null)) {
      payload.monthly_spending_limit = nextLimit;
    }

    const address: BillingAddress = {
      line1: data.line1,
      line2: data.line2 || null,
      postal_code: data.postal_code,
      city: data.city,
      state: data.state || null,
      country: data.country.toUpperCase(),
    };

    const addressChanged = addressFields.some(
      (field) => (address[field] ?? '') !== (tenant.billing_address?.[field] ?? ''),
    );

    if (addressChanged) {
      // The API validates the address as a whole, so blanking every field clears it.
      const isEmpty = addressFields.every((field) => !address[field]);
      payload.billing_address = isEmpty ? null : address;
    }

    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await updateTenant(tenant.id, payload);
      toast.success('Workspace updated.');
      onOpenChange(false);
      onChanged();
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update workspace.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit workspace</DialogTitle>
          <DialogDescription>
            Update the workspace name and billing details. Subscription and beta access are managed
            separately.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly_spending_limit">Monthly spending limit</Label>
            <Input
              id="monthly_spending_limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="No limit"
              {...register('monthly_spending_limit')}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="billing_name">Billing name</Label>
              <Input id="billing_name" {...register('billing_name')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="billing_email">Billing email</Label>
              <Input
                id="billing_email"
                type="email"
                {...register('billing_email', {
                  validate: (value) =>
                    !value || VALIDATION_REGEX.EMAIL.test(value) || 'Invalid email address',
                })}
              />
              {errors.billing_email && (
                <p className="text-destructive text-sm">{errors.billing_email.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="billing_phone_number">Billing phone number</Label>
            <Input
              id="billing_phone_number"
              placeholder="+31612345678"
              {...register('billing_phone_number')}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="line1">Address line 1</Label>
              <Input id="line1" {...register('line1')} />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="line2">Address line 2</Label>
              <Input id="line2" {...register('line2')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="postal_code">Postal code</Label>
              <Input id="postal_code" {...register('postal_code')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="state">State / province</Label>
              <Input id="state" {...register('state')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                maxLength={2}
                placeholder="NL"
                className="uppercase"
                {...register('country')}
              />
              <p className="text-muted-foreground text-xs">Two-letter ISO country code.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
