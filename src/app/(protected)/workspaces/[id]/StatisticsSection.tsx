'use client';

import { useEffect, useState } from 'react';
import { getTenantActivity } from '@/api/admin/tenants';
import type { Tenant, TenantActivity } from '@/api/admin/tenants/types';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}

export function StatisticsSection({ tenant }: { tenant: Tenant }) {
  const [activity, setActivity] = useState<TenantActivity | null>(null);
  const [activityFailed, setActivityFailed] = useState(false);

  useEffect(() => {
    getTenantActivity(tenant.id)
      .then(setActivity)
      .catch(() => setActivityFailed(true));
  }, [tenant.id]);

  const activityValue = (value: (activity: TenantActivity) => React.ReactNode) => {
    if (activityFailed) return '—';
    if (!activity) return <Skeleton className="mx-auto h-8 w-16" />;
    return value(activity);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Users" value={tenant.users_count} />
        <StatCard label="Pending invitations" value={tenant.pending_invitations_count} />
        <StatCard label="Contacts" value={tenant.contacts_count} />
        <StatCard label="Campaigns" value={tenant.campaigns_count} />
        <StatCard label="Active workflows/automations" value={tenant.active_workflows_count} />
        <StatCard label="Phone numbers" value={tenant.business_phone_numbers_count} />
        <StatCard label="Connected integrations" value={tenant.connected_integrations_count} />
        <StatCard
          label="Messages sent (30 days)"
          value={activityValue((a) => a.messages_sent_30d.toLocaleString())}
        />
        <StatCard
          label="Messages received (30 days)"
          value={activityValue((a) => a.messages_received_30d.toLocaleString())}
        />
      </div>
    </div>
  );
}
