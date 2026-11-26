'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUsers } from '@/api/admin/users';
import type { AdminUser } from '@/api/admin/users/types';
import Pagination from '@/components/common/Pagination';
import SearchInput from '@/components/common/SearchInput';
import SortableHead, { sortParam, type Sort } from '@/components/common/SortableHead';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [sort, setSort] = useState<Sort | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, showDeleted]);

  useEffect(() => {
    setLoading(true);
    getUsers({
      'page[number]': page,
      'page[size]': pageSize,
      search: debouncedSearch,
      sort: sortParam(sort),
      ...(showDeleted && { trashed: 'only' }),
    })
      .then((res) => {
        setUsers(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
      })
      .catch((err) => setError(err.message ?? 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, [page, pageSize, debouncedSearch, sort, showDeleted]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        {total !== null && (
          <p className="text-muted-foreground text-sm">{total} total</p>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search users…"
          className="max-w-sm"
        />
        <Tabs
          value={showDeleted ? 'deleted' : 'active'}
          onValueChange={(value) => setShowDeleted(value === 'deleted')}
        >
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="deleted">Deleted</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead column="firstname" sort={sort} onSortChange={setSort}>Name</SortableHead>
              <SortableHead column="email" sort={sort} onSortChange={setSort}>Email</SortableHead>
              <SortableHead column="tenants_count" sort={sort} onSortChange={setSort} className="text-right">Workspaces</SortableHead>
              <TableHead>Support access</TableHead>
              <SortableHead column="created_at" sort={sort} onSortChange={setSort}>Joined</SortableHead>
              <SortableHead column="last_activity_at" sort={sort} onSortChange={setSort}>Last active</SortableHead>
              {showDeleted ? (
                <SortableHead column="deleted_at" sort={sort} onSortChange={setSort}>Deleted</SortableHead>
              ) : (
                <TableHead />
              )}
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
                  className={user.deleted_at ? undefined : 'cursor-pointer'}
                  onClick={user.deleted_at ? undefined : () => router.push(APP_ROUTES.USER(user.id))}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {user.firstname}
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
                    {formatDateTime(user.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.last_activity_at ? formatDateTime(user.last_activity_at) : '—'}
                  </TableCell>
                  {user.deleted_at ? (
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(user.deleted_at)}
                    </TableCell>
                  ) : (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button asChild variant="outline" size="sm">
                        <Link href={APP_ROUTES.USER(user.id)}>View</Link>
                      </Button>
                    </TableCell>
                  )}
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
