'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getSession, logout, verifyTwoFactor } from '@/api/auth';
import { getUser } from '@/api/auth/user';
import TwoFactorAuthForm from '@/components/auth/TwoFactorAuthForm';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/constants/routes';
import { useUser } from '@/providers/UserContext';

const TwoFactorVerifyPage = () => {
  const router = useRouter();
  const { setUser } = useUser();

  const completeLogin = async () => {
    const user = await getUser();
    if (user) {
      setUser(user);
      router.push(APP_ROUTES.HOME);
    }
  };

  const handleVerify = async (code: string) => {
    await getSession();
    await verifyTwoFactor({ code: code.trim() });
    await completeLogin();
  };

  const handleRecoveryCodeVerify = async (recoveryCode: string) => {
    await getSession();
    await verifyTwoFactor({ code: recoveryCode.trim() });
    await completeLogin();
  };

  const handleLogout = async () => {
    try {
      await getSession();
      await logout();
    } catch (error) {
      toast.error((error as Error)?.message || 'Logout failed');
    } finally {
      setUser(null);
      router.replace(APP_ROUTES.SIGN_IN);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <TwoFactorAuthForm onVerify={handleVerify} onVerifyRecoveryCode={handleRecoveryCodeVerify} />
      <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
        Sign out
      </Button>
    </div>
  );
};

export default TwoFactorVerifyPage;
