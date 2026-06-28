'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { disableTwoFactor } from '@/api/auth';
import { getUser } from '@/api/auth/user';
import DisableTwoFactorDialog from '@/components/settings/security/DisableTwoFactorDialog';
import EnableTwoFactorDialog from '@/components/settings/security/EnableTwoFactorDialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/providers/UserContext';

const SecurityPage = () => {
  const { user, setUser } = useUser();
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isDisablingTwoFactor, setIsDisablingTwoFactor] = useState(false);

  const refreshUser = async () => {
    const nextUser = await getUser();
    setUser(nextUser);
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="text-muted-foreground text-sm">Manage your account security settings.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Two-factor authentication (2FA)</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Add an extra layer of security to your account by requiring a verification code in addition to your
            password when signing in.
          </p>
        </div>

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
      </div>
    </div>
  );
};

export default SecurityPage;
