'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUsers } from '@/api/admin/users';
import type { AdminUser } from '@/api/admin/users/types';
import Pagination from '@/components/common/Pagination';
import SearchInput from '@/components/common/SearchInput';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    getUsers({ 'page[number]': page, 'page[size]': pageSize, search: debouncedSearch })
      .then((res) => {
        setUsers(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
      })
      .catch((err) => setError(err.message ?? 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, [page, pageSize, debouncedSearch]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        {total !== null && (
          <p className="text-muted-foreground text-sm">{total} total</p>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search users…"
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Workspaces</TableHead>
              <TableHead>Support access</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => router.push(APP_ROUTES.USER(user.id))}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {user.name}
                      {user.is_admin && <Badge variant="outline">Admin</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user.tenants_count ?? 0}</TableCell>
                  <TableCell>
                    {user.support_access_enabled ? (
                      <Badge>Enabled</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Disabled</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.last_activity_at ? formatDate(user.last_activity_at) : '—'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button asChild variant="outline" size="sm">
                      <Link href={APP_ROUTES.USER(user.id)}>View</Link>
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
