'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getTenant } from '@/api/admin/tenants';
import type { Tenant } from '@/api/admin/tenants/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatDateTime } from '@/lib/utils';
import { APP_ROUTES } from '@/constants/routes';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-muted-foreground text-xs mt-1">{label}</p>
    </div>
  );
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTenant(id)
      .then(setTenant)
      .catch((err) => setError(err.message ?? 'Failed to load tenant.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  if (!tenant) return null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={APP_ROUTES.TENANTS}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Tenants
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">{tenant.name}</h1>
        <Badge variant="outline" className="font-mono text-xs">
          {tenant.reference}
        </Badge>
        {tenant.deleted_at && (
          <Badge variant="destructive">Deleted</Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailRow label="Name" value={tenant.name} />
            <DetailRow label="Reference" value={
              <span className="font-mono">{tenant.reference}</span>
            } />
            <DetailRow label="Personal workspace" value={tenant.is_personal ? 'Yes' : 'No'} />
            <DetailRow label="Stripe ID" value={tenant.stripe_id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailRow label="Plan" value={
              tenant.subscription_plan ? (
                <Badge variant="secondary" className="capitalize">
                  {tenant.subscription_plan}
                </Badge>
              ) : null
            } />
            <DetailRow label="On trial" value={tenant.is_on_trial ? 'Yes' : 'No'} />
            <DetailRow label="Trial ends at" value={
              tenant.trial_ends_at ? formatDate(tenant.trial_ends_at) : null
            } />
            <DetailRow label="Monthly spending limit" value={
              tenant.monthly_spending_limit != null
                ? `$${tenant.monthly_spending_limit}`
                : null
            } />
            <DetailRow label="Exceeded spending limit" value={
              tenant.has_exceeded_spending_limit ? (
                <Badge variant="destructive">Yes</Badge>
              ) : 'No'
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailRow label="Name" value={`${tenant.owner.firstname} ${tenant.owner.lastname}`} />
            <DetailRow label="Email" value={tenant.owner.email} />
            <DetailRow label="User ID" value={
              <span className="font-mono text-xs">{tenant.owner.id}</span>
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <DetailRow label="Created" value={formatDateTime(tenant.created_at)} />
            <DetailRow label="Updated" value={formatDateTime(tenant.updated_at)} />
            <DetailRow label="Deleted" value={
              tenant.deleted_at ? formatDateTime(tenant.deleted_at) : null
            } />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Users" value={tenant.users_count} />
          <StatCard label="Campaigns" value={tenant.campaigns_count} />
          <StatCard label="Workflows" value={tenant.workflows_count} />
          <StatCard label="Contacts" value={tenant.contacts_count} />
        </div>
      </div>
    </div>
  );
}
