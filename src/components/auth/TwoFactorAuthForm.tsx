'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Inputs = {
  code: string;
};

interface Props {
  onVerify?: (code: string) => Promise<void>;
  onVerifyRecoveryCode?: (recoveryCode: string) => Promise<void>;
}

const TwoFactorAuthForm = ({ onVerify, onVerifyRecoveryCode }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const value = data.code.trim();

    setIsLoading(true);
    try {
      if (isRecoveryMode && onVerifyRecoveryCode) {
        await onVerifyRecoveryCode(value);
      } else {
        await onVerify?.(value);
      }
    } catch (error) {
      toast.error((error as Error)?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your identity</h1>
        <p className="text-muted-foreground text-sm">
          To keep your account secure, please enter the code from your authenticator app to continue.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">
            {isRecoveryMode ? 'Recovery code' : 'Authenticator code'}
          </Label>
          <Input
            id="code"
            type="text"
            inputMode={isRecoveryMode ? 'text' : 'numeric'}
            placeholder={isRecoveryMode ? 'Paste recovery code' : '6-digit code'}
            autoComplete="one-time-code"
            {...register('code', {
              required: 'Field is required',
              validate: (value) => {
                if (isRecoveryMode) {
                  return value.trim().length > 0 || 'Please enter a valid recovery code';
                }
                return /^\d{6}$/.test(value.trim()) || 'Please enter a valid 6-digit code';
              },
            })}
          />
          {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
        </div>

        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isLoading} className="w-full">
          {isLoading ? 'Verifying...' : 'Verify & continue'}
        </Button>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        {isRecoveryMode ? (
          <>
            Want to use your authenticator app instead?{' '}
            <button type="button" onClick={() => setIsRecoveryMode(false)} className="text-primary underline">
              Use authenticator code
            </button>
          </>
        ) : (
          <>
            Can&apos;t access your authenticator?{' '}
            <button type="button" onClick={() => setIsRecoveryMode(true)} className="text-primary underline">
              Use a recovery code
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default TwoFactorAuthForm;
