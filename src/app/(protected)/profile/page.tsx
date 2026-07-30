'use client';

import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { disableTwoFactor } from '@/api/auth';
import { getUser, updateUser } from '@/api/auth/user';
import DisableTwoFactorDialog from '@/components/settings/security/DisableTwoFactorDialog';
import EnableTwoFactorDialog from '@/components/settings/security/EnableTwoFactorDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VALIDATION_REGEX } from '@/constants/validation';
import { useUser } from '@/providers/UserContext';

type AccountInputs = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isDisablingTwoFactor, setIsDisablingTwoFactor] = useState(false);

  const {
    formState: { errors: accountErrors, isSubmitting: isSavingAccount },
    handleSubmit: handleAccountSubmit,
    register: registerAccount,
    reset: resetAccount,
  } = useForm<AccountInputs>();

  const {
    formState: { errors: passwordErrors, isSubmitting: isSavingPassword },
    handleSubmit: handlePasswordSubmit,
    register: registerPassword,
    reset: resetPassword,
    watch,
  } = useForm<PasswordInputs>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!user) return;

    resetAccount({
      firstName: user.firstname || '',
      lastName: user.lastname || '',
      email: user.email || '',
    });
  }, [user, resetAccount]);

  const refreshUser = async () => {
    const nextUser = await getUser();
    setUser(nextUser);
  };

  const onAccountSubmit: SubmitHandler<AccountInputs> = async (data) => {
    const emailChanged = data.email !== user?.email;

    try {
      await updateUser({
        ...(data.firstName !== user?.firstname && { firstname: data.firstName }),
        ...(data.lastName !== user?.lastname && { lastname: data.lastName }),
        ...(emailChanged && { email: data.email }),
      });

      await refreshUser();

      toast.success(
        emailChanged
          ? 'A verification link has been sent to your new email address.'
          : 'Profile updated successfully.',
      );
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update profile.');
    }
  };

  const onPasswordSubmit: SubmitHandler<PasswordInputs> = async (data) => {
    try {
      await updateUser({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,
      });

      await refreshUser();
      resetPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully.');
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to update password.');
    }
  };

  const handleDisableTwoFactor = async () => {
    setIsDisablingTwoFactor(true);
    try {
      await disableTwoFactor();
      await refreshUser();
      toast.success('Two-factor authentication has been disabled');
      setIsDisableDialogOpen(false);
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to disable two-factor authentication');
    } finally {
      setIsDisablingTwoFactor(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account details and security settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleAccountSubmit(onAccountSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Enter a first name"
                {...registerAccount('firstName', { required: 'First name is required' })}
              />
              {accountErrors.firstName && (
                <p className="text-destructive text-sm">{accountErrors.firstName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Enter a last name"
                {...registerAccount('lastName', { required: 'Last name is required' })}
              />
              {accountErrors.lastName && (
                <p className="text-destructive text-sm">{accountErrors.lastName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...registerAccount('email', {
                  required: 'Email address is required',
                  validate: (value) => VALIDATION_REGEX.EMAIL.test(value) || 'Invalid email address',
                })}
              />
              {accountErrors.email && <p className="text-destructive text-sm">{accountErrors.email.message}</p>}
              {user?.pending_email && (
                <p className="text-muted-foreground text-xs">
                  Pending verification: <span className="text-foreground">{user.pending_email}</span>. Check that
                  inbox for a verification link.
                </p>
              )}
            </div>

            <div>
              <Button type="submit" disabled={isSavingAccount}>
                {isSavingAccount ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
              />
              {passwordErrors.currentPassword && (
                <p className="text-destructive text-sm">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword('newPassword', { required: 'New password is required' })}
              />
              {passwordErrors.newPassword && (
                <p className="text-destructive text-sm">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                })}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-destructive text-sm">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication (2FA)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Add an extra layer of security to your account by requiring a verification code in addition to your
            password when signing in.
          </p>

          <div className="flex items-center gap-3">
            {user?.two_factor_enabled ? (
              <>
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Enabled
                </span>
                <Button variant="destructive" onClick={() => setIsDisableDialogOpen(true)}>
                  Disable
                </Button>
                <DisableTwoFactorDialog
                  open={isDisableDialogOpen}
                  onOpenChange={setIsDisableDialogOpen}
                  onDisable={() => void handleDisableTwoFactor()}
                  isDisabling={isDisablingTwoFactor}
                />
              </>
            ) : (
              <>
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Not enabled
                </span>
                <EnableTwoFactorDialog trigger={<Button>Activate</Button>} onEnabled={refreshUser} />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
