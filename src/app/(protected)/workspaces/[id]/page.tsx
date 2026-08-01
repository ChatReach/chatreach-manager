'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getTenant } from '@/api/admin/tenants';
import type { Tenant } from '@/api/admin/tenants/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatDateTime } from '@/lib/utils';
import { APP_ROUTES } from '@/constants/routes';
import { BetaAccessCard } from './BetaAccessCard';
import { EditWorkspaceDialog } from './EditWorkspaceDialog';
import { ManageSubscriptionDialog } from './ManageSubscriptionDialog';

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

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const loadTenant = () => {
    getTenant(id)
      .then(setTenant)
      .catch((err) => setError(err.message ?? 'Failed to load workspace.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        href={APP_ROUTES.WORKSPACES}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Workspaces
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">{tenant.name}</h1>
        <Badge variant="outline" className="font-mono text-xs">
          {tenant.reference}
        </Badge>
        {tenant.deleted_at && (
          <Badge variant="destructive">Deleted</Badge>
        )}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      {/* Organization/tenant details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Name" value={tenant.name} />
            <DetailRow label="Reference" value={
              <span className="font-mono">{tenant.reference}</span>
            } />
            <DetailRow label="Personal workspace" value={tenant.is_personal ? 'Yes' : 'No'} />
            <DetailRow label="Stripe ID" value={tenant.stripe_id} />
            <DetailRow label="Created" value={formatDateTime(tenant.created_at)} />
            <DetailRow label="Updated" value={formatDateTime(tenant.updated_at)} />
            <DetailRow label="Deleted" value={
              tenant.deleted_at ? formatDateTime(tenant.deleted_at) : null
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Subscription</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
              Manage
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Plan" value={
              tenant.subscription_plan ? (
                <Badge variant="secondary" className="capitalize">
                  {tenant.subscription_plan}
                </Badge>
              ) : null
            } />
            <DetailRow label="" value=""/>
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

        <BetaAccessCard
          tenantId={tenant.id}
          status={tenant.beta_access_status}
          requestedAt={tenant.beta_access_requested_at}
          onChanged={loadTenant}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Billing name" value={tenant.billing_name} />
            <DetailRow label="Billing email" value={tenant.billing_email} />
            <DetailRow label="Billing phone" value={tenant.billing_phone_number} />
            <DetailRow
              label="Billing address"
              value={
                tenant.billing_address
                  ? [
                      tenant.billing_address.line1,
                      tenant.billing_address.line2,
                      `${tenant.billing_address.postal_code} ${tenant.billing_address.city}`,
                      tenant.billing_address.state,
                      tenant.billing_address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : null
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-base font-semibold mb-3">Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Users" value={tenant.users_count} />
          <StatCard label="Campaigns" value={tenant.campaigns_count} />
          <StatCard label="Workflows" value={tenant.workflows_count} />
          <StatCard label="Contacts" value={tenant.contacts_count} />
        </div>
      </div>

      {/* Members */}
      <div>
        <h2 className="text-base font-semibold mb-3">Members</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.users?.length ? (
                tenant.users.map((member) => (
                  <TableRow
                    key={member.id}
                    className="cursor-pointer"
                    onClick={() => router.push(APP_ROUTES.USER(member.id))}
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={APP_ROUTES.USER(member.id)}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.firstname} {member.lastname}
                      </Link>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {member.role ? (
                        <Badge variant="secondary" className="capitalize">
                          {member.role}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground text-center">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ManageSubscriptionDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        tenantId={tenant.id}
        onChanged={loadTenant}
      />

      <EditWorkspaceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        tenant={tenant}
        onChanged={loadTenant}
      />
    </div>
  );
}
