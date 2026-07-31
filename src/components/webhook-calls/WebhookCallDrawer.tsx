'use client';

import WebhookCallDetails, {
  WebhookCallDetailsSkeleton,
  useWebhookCall,
} from '@/components/webhook-calls/WebhookCallDetails';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

function DrawerBody({ id }: { id: string }) {
  const { webhookCall, loading, error } = useWebhookCall(id);

  if (loading) {
    return (
      <>
        <DrawerHeader>
          <DrawerTitle>Webhook Call</DrawerTitle>
          <DrawerDescription className="sr-only">Loading webhook call details</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <WebhookCallDetailsSkeleton />
        </div>
      </>
    );
  }

  if (error || !webhookCall) {
    return (
      <>
        <DrawerHeader>
          <DrawerTitle>Webhook Call</DrawerTitle>
          <DrawerDescription className="sr-only">Failed to load webhook call</DrawerDescription>
        </DrawerHeader>
        <p className="text-destructive px-4 pb-4 text-sm">
          {error ?? 'Failed to load webhook call.'}
        </p>
      </>
    );
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="capitalize">{webhookCall.name}</DrawerTitle>
        <DrawerDescription className="break-all">{webhookCall.url}</DrawerDescription>
      </DrawerHeader>
      <div className="overflow-y-auto px-4 pb-4">
        <WebhookCallDetails webhookCall={webhookCall} />
      </div>
    </>
  );
}

export default function WebhookCallDrawer({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      direction="right"
      open={id !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        {id && <DrawerBody id={id} />}
      </DrawerContent>
    </Drawer>
  );
}
