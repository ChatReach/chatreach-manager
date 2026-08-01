'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldOff } from 'lucide-react';
import { getUser } from '@/api/admin/users';
import type { AdminUser } from '@/api/admin/users/types';
import { EditUserDialog } from './EditUserDialog';
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

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(() => {
    getUser(id)
      .then(setUser)
      .catch((err) => setError(err.message ?? 'Failed to load user.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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

  if (!user) return null;

  const supportAccess = user.support_access_enabled;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={APP_ROUTES.USERS}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        {user.is_admin && <Badge variant="outline">Admin</Badge>}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        onChanged={load}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="First name" value={user.firstname} />
            <DetailRow label="Last name" value={user.lastname} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone number" value={user.phone_number} />
            <DetailRow label="Email verified" value={
              user.email_verified_at ? formatDateTime(user.email_verified_at) : 'No'
            } />
            <DetailRow label="Two-factor" value={
              user.two_factor_enabled ? 'Enabled' : 'Disabled'
            } />
            <DetailRow label="Marketing" value={
              user.marketing_unsubscribed_at
                ? `Unsubscribed on ${formatDate(user.marketing_unsubscribed_at)}`
                : 'Subscribed'
            } />
            <DetailRow label="Admin" value={user.is_admin ? 'Yes' : 'No'} />
            <DetailRow label="User ID" value={
              <span className="font-mono text-xs">{user.id}</span>
            } />
            <DetailRow label="Joined" value={formatDateTime(user.created_at)} />
            <DetailRow label="Last updated" value={
              user.updated_at ? formatDateTime(user.updated_at) : null
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Support Access</CardTitle>
            <Badge variant={supportAccess ? 'default' : 'secondary'}>
              {supportAccess ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DetailRow label="Expires" value={
              user.support_access_until ? formatDateTime(user.support_access_until) : null
            } />

            {supportAccess ? (
              <>
                <p className="text-muted-foreground text-sm">
                  This user granted support access, so you can sign in as them.
                </p>
                <div>
                  <Button variant="outline" size="sm" disabled title="Coming soon">
                    Impersonate
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex items-start gap-2 text-sm">
                <ShieldOff className="size-4 shrink-0 mt-0.5" />
                <span>
                  Impersonation is unavailable. Only this user can grant support access, from
                  their own account settings.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspaces</CardTitle>
        </CardHeader>
        <CardContent>
          {user.tenants?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.tenants.map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/workspaces/${tenant.id}`)}
                  >
                    <TableCell>
                      <Link
                        href={`/workspaces/${tenant.id}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tenant.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {tenant.role ? (
                        <Badge variant="secondary" className="capitalize">
                          {tenant.role}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              This user does not belong to any workspace.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
