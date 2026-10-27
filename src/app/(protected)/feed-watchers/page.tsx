'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteFeedWatcher, getFeedWatchers } from '@/api/admin/feed-watchers';
import type { FeedWatcher } from '@/api/admin/feed-watchers/types';
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
import { FeedWatcherFormDialog } from './FeedWatcherFormDialog';

export default function FeedWatchersPage() {
  const [watchers, setWatchers] = useState<FeedWatcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeedWatcher | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getFeedWatchers()
      .then(setWatchers)
      .catch((err) => setError(err.message ?? 'Failed to load feed watchers.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDialog = (watcher: FeedWatcher | null) => {
    setEditing(watcher);
    setDialogOpen(true);
  };

  const handleDelete = async (watcher: FeedWatcher) => {
    if (!window.confirm(`Delete feed watcher "${watcher.name}"?`)) return;
    try {
      await deleteFeedWatcher(watcher.id);
      toast.success('Feed watcher deleted.');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete feed watcher.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Feed Watchers</h1>
          <p className="text-muted-foreground text-sm">Post new RSS feed items to a Slack channel.</p>
        </div>
        <Button onClick={() => openDialog(null)}>
          <Plus className="size-4" />
          Add Feed Watcher
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <Skeleton className="h-40" />
      ) : watchers.length === 0 ? (
        <p className="text-muted-foreground text-sm">No feed watchers yet. Add your first one.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Feed</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last checked</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchers.map((watcher) => (
                <TableRow key={watcher.id}>
                  <TableCell className="font-medium">{watcher.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs" title={watcher.feed_url}>
                    {watcher.feed_url}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{watcher.slack_channel}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      {watcher.enabled ? (
                        <Badge variant="secondary">Enabled</Badge>
                      ) : (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                      {watcher.last_error && (
                        <span className="text-destructive max-w-xs text-xs" title={watcher.last_error}>
                          {watcher.last_error}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{watcher.last_checked_at ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(watcher)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(watcher)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dialogOpen && (
        <FeedWatcherFormDialog open={dialogOpen} onOpenChange={setDialogOpen} watcher={editing} onSaved={load} />
      )}
    </div>
  );
}
