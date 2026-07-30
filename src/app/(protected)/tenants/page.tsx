'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTenants } from '@/api/admin/tenants';
import type { Tenant } from '@/api/admin/tenants/types';
import Pagination from '@/components/common/Pagination';
import { BETA_ACCESS_STATUS_BADGE } from '@/lib/betaAccess';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/constants/routes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTenants({ 'page[number]': page, 'page[size]': pageSize })
      .then((res) => {
        setTenants(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
      })
      .catch((err) => setError(err.message ?? 'Failed to load tenants.'))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tenants</h1>
          {total !== null && (
            <p className="text-muted-foreground text-sm">{total} total</p>
          )}
        </div>
        <Button asChild>
          <Link href={APP_ROUTES.TENANTS_CREATE}>Create Tenant</Link>
        </Button>
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Beta Access</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground text-center">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {tenant.reference}
                  </TableCell>
                  <TableCell>
                    {tenant.owner.firstname} {tenant.owner.lastname}
                  </TableCell>
                  <TableCell>
                    {tenant.subscription_plan ? (
                      <Badge variant="secondary" className="capitalize">
                        {tenant.subscription_plan}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tenant.is_on_trial ? (
                      <Badge variant="outline">Trial</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={BETA_ACCESS_STATUS_BADGE[tenant.beta_access_status].variant}>
                      {BETA_ACCESS_STATUS_BADGE[tenant.beta_access_status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{tenant.users_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(tenant.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tenants/${tenant.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          lastPage={lastPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
