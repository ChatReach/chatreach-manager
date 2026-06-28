'use client';

import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

import { confirmTwoFactor, enableTwoFactor, regenerateTwoFactorRecoveryCodes, verifyTwoFactor } from '@/api/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Props {
  trigger: ReactNode;
  onEnabled?: () => void | Promise<void>;
}

const EnableTwoFactorDialog = ({ trigger, onEnabled }: Props) => {
  const [open, setOpen] = useState(false);
  const [isProvisioningLoading, setIsProvisioningLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [setupKey, setSetupKey] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [code, setCode] = useState('');
  const [isRecoveryCodesDialogOpen, setIsRecoveryCodesDialogOpen] = useState(false);
  const [isRecoveryCodesLoading, setIsRecoveryCodesLoading] = useState(false);
  const [isCopyingRecoveryCodes, setIsCopyingRecoveryCodes] = useState(false);
  const [shouldRefreshAfterRecoveryDialog, setShouldRefreshAfterRecoveryDialog] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showInvalidCodeError, setShowInvalidCodeError] = useState(false);

  const qrImageSrc = qrSvg.startsWith('data:image/')
    ? qrSvg
    : qrSvg.trim().startsWith('<')
      ? `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`
      : '';

  const fetchProvisioningData = async () => {
    setIsProvisioningLoading(true);
    try {
      const response = await enableTwoFactor();
      setSetupKey(response?.secret ?? '');
      setQrSvg(response?.qr_svg ?? '');
    } catch (error) {
      setSetupKey('');
      setQrSvg('');
      toast.error((error as Error)?.message || 'Failed to generate 2FA setup details');
    } finally {
      setIsProvisioningLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setCode('');
    setShowInvalidCodeError(false);
    setRecoveryCodes([]);
    void fetchProvisioningData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchRecoveryCodes = async () => {
    setIsRecoveryCodesLoading(true);
    try {
      const response = await regenerateTwoFactorRecoveryCodes();
      setRecoveryCodes(response?.recovery_codes ?? []);
    } catch (error) {
      setRecoveryCodes([]);
      toast.error((error as Error)?.message || 'Two-factor authentication was enabled, but recovery codes failed to load');
    } finally {
      setIsRecoveryCodesLoading(false);
    }
  };

  const handleCopyRecoveryCodes = async () => {
    if (!recoveryCodes.length || isCopyingRecoveryCodes) return;
    setIsCopyingRecoveryCodes(true);
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      toast.success('Recovery codes copied to clipboard');
    } catch {
      toast.error('Failed to copy recovery codes');
    } finally {
      setIsCopyingRecoveryCodes(false);
    }
  };

  const finalizeEnableFlow = async () => {
    if (!shouldRefreshAfterRecoveryDialog) return;
    setShouldRefreshAfterRecoveryDialog(false);
    try {
      await onEnabled?.();
    } catch (error) {
      toast.error((error as Error)?.message || 'Two-factor authentication was enabled, but failed to refresh settings');
    }
  };

  const handleConfirm = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setIsConfirming(true);
    setShowInvalidCodeError(false);

    try {
      await confirmTwoFactor({ code: trimmedCode });
      await verifyTwoFactor({ code: trimmedCode });
      await fetchRecoveryCodes();
      toast.success('Two-factor authentication has been enabled');
      setShouldRefreshAfterRecoveryDialog(true);
      setOpen(false);
      setIsRecoveryCodesDialogOpen(true);
    } catch (error) {
      const message = (error as Error)?.message || 'Failed to confirm two-factor authentication';
      if (message.toLowerCase().includes('invalid')) {
        setShowInvalidCodeError(true);
        return;
      }
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>

        <DialogContent className="max-h-[95svh] w-full max-w-lg gap-0 overflow-auto p-0" showCloseButton>
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold">Enable two-factor authentication</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            <p className="text-muted-foreground text-sm leading-5">
              Add an extra layer of security to your account. You&apos;ll need a code from your authenticator app each
              time you sign in.
            </p>

            <div>
              <div className="mb-1 text-sm font-semibold">Scan QR code</div>
              <p className="text-muted-foreground text-sm leading-5">
                Use your authenticator app (Google Authenticator, Authy, 1Password, etc.) to scan the QR code below.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-muted flex size-40 items-center justify-center overflow-hidden rounded-lg border">
                {qrImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrImageSrc}
                    alt="2FA QR code"
                    className="block size-40 rounded-lg object-contain"
                    width={160}
                    height={160}
                    draggable={false}
                  />
                ) : (
                  <QRCode value={setupKey || '2fa'} size={130} />
                )}
              </div>
              <button
                type="button"
                onClick={() => void fetchProvisioningData()}
                disabled={isProvisioningLoading}
                className="text-primary mt-3 text-sm underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProvisioningLoading ? 'Refreshing...' : 'Refresh code'}
              </button>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold">Setup key</div>
              <div className="bg-muted rounded-lg border px-4 py-3 text-sm font-mono">
                {isProvisioningLoading ? 'Generating setup key...' : setupKey || '-'}
              </div>
            </div>

            <div>
              <div className="mb-1 text-sm font-semibold">Enter code</div>
              <p className="text-muted-foreground mb-2 text-sm">6-digit code from your authenticator app</p>
              <Input
                placeholder="Enter code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  if (showInvalidCodeError) setShowInvalidCodeError(false);
                }}
              />
              {showInvalidCodeError && (
                <p className="text-destructive mt-2 text-sm">Invalid verification code. Please try again.</p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => void handleConfirm()} disabled={code.trim().length !== 6 || isConfirming}>
              {isConfirming ? 'Activating...' : 'Activate 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRecoveryCodesDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsRecoveryCodesDialogOpen(nextOpen);
          if (!nextOpen) void finalizeEnableFlow();
        }}
      >
        <DialogContent className="max-h-[95svh] w-full max-w-lg gap-0 overflow-auto p-0" showCloseButton>
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold">Save your recovery codes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 py-6">
            <p className="text-muted-foreground text-sm leading-5">
              Keep these recovery codes in a safe place. You can use each code once if you lose access to your
              authenticator app.
            </p>
            <p className="text-muted-foreground text-xs">Regenerating codes will invalidate the current set.</p>

            <div className="bg-muted rounded-lg border p-4">
              {isRecoveryCodesLoading ? (
                <p className="text-muted-foreground text-sm">Loading recovery codes...</p>
              ) : recoveryCodes.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {recoveryCodes.map((recoveryCode) => (
                    <li key={recoveryCode} className="bg-background rounded-md border px-3 py-2 font-mono text-xs">
                      {recoveryCode}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No recovery codes available.</p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4 sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void handleCopyRecoveryCodes()}
                disabled={!recoveryCodes.length || isCopyingRecoveryCodes}
              >
                {isCopyingRecoveryCodes ? 'Copying...' : 'Copy codes'}
              </Button>
              <Button variant="outline" onClick={() => void fetchRecoveryCodes()} disabled={isRecoveryCodesLoading}>
                {isRecoveryCodesLoading ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
            <DialogClose asChild>
              <Button>I saved these codes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnableTwoFactorDialog;
