'use client';

import { useEffect, useState } from 'react';
import { getWebhookCall } from '@/api/admin/webhookCalls';
import type { WebhookCall } from '@/api/admin/webhookCalls/types';
import JsonViewer from '@/components/common/JsonViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}

export function useWebhookCall(id: string) {
  const [webhookCall, setWebhookCall] = useState<WebhookCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWebhookCall(id)
      .then(setWebhookCall)
      .catch((err) => setError(err.message ?? 'Failed to load webhook call.'))
      .finally(() => setLoading(false));
  }, [id]);

  return { webhookCall, loading, error };
}

export function WebhookCallDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
      <Skeleton className="h-40" />
    </div>
  );
}

export default function WebhookCallDetails({ webhookCall }: { webhookCall: WebhookCall }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailRow label="Name" value={<span className="capitalize">{webhookCall.name}</span>} />
            <DetailRow label="URL" value={<span className="break-all">{webhookCall.url}</span>} />
            <DetailRow label="Received At" value={formatDateTime(webhookCall.created_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exception</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonViewer value={webhookCall.exception} emptyText="No exception recorded" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <JsonViewer value={webhookCall.payload} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <JsonViewer value={webhookCall.headers} />
        </CardContent>
      </Card>
    </div>
  );
}
