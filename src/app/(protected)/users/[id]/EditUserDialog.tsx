'use client';

import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { sendPasswordResetEmail, updateUser } from '@/api/admin/users';
import type { AdminUser, UpdateUserPayload } from '@/api/admin/users/types';
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
import { VALIDATION_REGEX } from '@/constants/validation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
  onChanged: () => void;
}

type Inputs = {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  marketing_emails: boolean;
};

export function EditUserDialog({ open, onOpenChange, user, onChanged }: Props) {
  const [sendingReset, setSendingReset] = useState(false);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<Inputs>();

  const subscribedToMarketing = !user.marketing_unsubscribed_at;

  useEffect(() => {
    if (!open) return;

    reset({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone_number: user.phone_number ?? '',
      marketing_emails: subscribedToMarketing,
    });
  }, [open, user, subscribedToMarketing, reset]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const payload: UpdateUserPayload = {
      ...(data.firstname !== user.firstname && { firstname: data.firstname }),
      ...(data.lastname !== user.lastname && { lastname: data.lastname }),
      ...(data.email !== user.email && { email: data.email }),
      ...(data.phone_number !== (user.phone_number ?? '') && {
        phone_number: data.phone_number || null,
      }),
      ...(data.marketing_emails !== subscribedToMarketing && {
        marketing_emails: data.marketing_emails,
      }),
    };

    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      await updateUser(user.id, payload);
      toast.success('User updated.');
      onOpenChange(false);
      onChanged();
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update user.');
    }
  };

  const handleSendPasswordReset = async () => {
    if (!window.confirm(`Send a password reset email to ${user.email}?`)) return;

    setSendingReset(true);
    try {
      await sendPasswordResetEmail(user.id);
      toast.success('Password reset email sent.');
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to send password reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update this user&apos;s account details. Admin access and support access are managed
            elsewhere.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                {...register('firstname', { required: 'First name is required' })}
              />
              {errors.firstname && (
                <p className="text-destructive text-sm">{errors.firstname.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                {...register('lastname', { required: 'Last name is required' })}
              />
              {errors.lastname && (
                <p className="text-destructive text-sm">{errors.lastname.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email address is required',
                validate: (value) => VALIDATION_REGEX.EMAIL.test(value) || 'Invalid email address',
              })}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            <p className="text-muted-foreground text-xs">
              Changing this takes effect immediately, without a verification email.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone_number">Phone number</Label>
            <Input id="phone_number" placeholder="+31612345678" {...register('phone_number')} />
          </div>

          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="marketing_emails"
              render={({ field }) => (
                <Checkbox
                  id="marketing_emails"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <Label htmlFor="marketing_emails" className="font-normal">
              Subscribed to marketing emails
            </Label>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={sendingReset}
              onClick={handleSendPasswordReset}
            >
              {sendingReset ? 'Sending...' : 'Send password reset'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
