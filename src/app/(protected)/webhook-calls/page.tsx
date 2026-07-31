'use client';

import { useEffect, useState } from 'react';
import { getWebhookCalls } from '@/api/admin/webhookCalls';
import type { WebhookCall } from '@/api/admin/webhookCalls/types';
import Pagination from '@/components/common/Pagination';
import SearchInput from '@/components/common/SearchInput';
import WebhookCallDrawer from '@/components/webhook-calls/WebhookCallDrawer';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function WebhookCallsPage() {
  const [webhookCalls, setWebhookCalls] = useState<WebhookCall[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    getWebhookCalls({ 'page[number]': page, 'page[size]': pageSize, search: debouncedSearch })
      .then((res) => {
        setWebhookCalls(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
      })
      .catch((err) => setError(err.message ?? 'Failed to load webhook calls.'))
      .finally(() => setLoading(false));
  }, [page, pageSize, debouncedSearch]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Webhook Calls</h1>
        {total !== null && (
          <p className="text-muted-foreground text-sm">{total} total</p>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search webhook calls…"
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Received At</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : webhookCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  No webhook calls found.
                </TableCell>
              </TableRow>
            ) : (
              webhookCalls.map((webhookCall) => (
                <TableRow
                  key={webhookCall.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(webhookCall.id)}
                >
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {webhookCall.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate font-mono text-xs">
                    {webhookCall.url}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(webhookCall.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View
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

      <WebhookCallDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
