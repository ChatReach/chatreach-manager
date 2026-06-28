'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisable: () => void;
  isDisabling?: boolean;
}

const DisableTwoFactorDialog = ({ open, onOpenChange, onDisable, isDisabling = false }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg gap-0 p-0" showCloseButton={false}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base font-semibold">Disable two-factor authentication?</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <DialogDescription>
            Are you sure you want to disable 2FA? Your account will be less secure without this extra verification
            step.
          </DialogDescription>
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDisabling}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onDisable} disabled={isDisabling}>
            {isDisabling ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisableTwoFactorDialog;
