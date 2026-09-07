'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { startImpersonation } from '@/api/admin/users';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  userId: string;
  userName: string;
}

type Inputs = {
  reason: string;
};

export function ImpersonateDialog({ userId, userName }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<Inputs>();

  const onOpenChange = (next: boolean) => {
    setOpen(next);

    if (!next) {
      setError(null);
      reset();
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ reason }) => {
    setError(null);

    try {
      const { consume_url } = await startImpersonation(userId, reason);

      window.open(consume_url, '_blank', 'noopener,noreferrer');
      onOpenChange(false);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to start the support session.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Impersonate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Start a support session</DialogTitle>
            <DialogDescription>
              You will be signed in as {userName} in a new tab. The session is logged, ends after
              60 minutes, and stops the moment they revoke support access.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="reason">Reason or ticket reference</Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="Investigating ticket #1234 — campaign fails to send"
              {...register('reason', {
                required: 'A reason is required.',
                minLength: { value: 10, message: 'Describe the reason in at least 10 characters.' },
                maxLength: { value: 250, message: 'Keep the reason under 250 characters.' },
              })}
            />
            {errors.reason && <p className="text-destructive text-sm">{errors.reason.message}</p>}
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Starting…' : 'Start support session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
