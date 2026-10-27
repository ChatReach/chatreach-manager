'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createFeedWatcher, updateFeedWatcher } from '@/api/admin/feed-watchers';
import type { FeedWatcher } from '@/api/admin/feed-watchers/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watcher?: FeedWatcher | null;
  onSaved: () => void;
}

interface FormInputs {
  name: string;
  feed_url: string;
  slack_channel: string;
  enabled: boolean;
}

const buildDefaults = (watcher?: FeedWatcher | null): FormInputs => ({
  name: watcher?.name ?? '',
  feed_url: watcher?.feed_url ?? '',
  slack_channel: watcher?.slack_channel ?? '',
  enabled: watcher?.enabled ?? true,
});

export function FeedWatcherFormDialog({ open, onOpenChange, watcher, onSaved }: Props) {
  const isEdit = !!watcher;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({ defaultValues: buildDefaults(watcher) });

  const enabled = watch('enabled');

  useEffect(() => {
    if (open) reset(buildDefaults(watcher));
  }, [open, watcher, reset]);

  const onSubmit = async (data: FormInputs) => {
    setSubmitting(true);
    try {
      if (isEdit && watcher) {
        await updateFeedWatcher(watcher.id, data);
        toast.success('Feed watcher updated.');
      } else {
        await createFeedWatcher(data);
        toast.success('Feed watcher created.');
      }
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save feed watcher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Feed Watcher' : 'Add Feed Watcher'}</DialogTitle>
          <DialogDescription>
            New items in the RSS feed are posted to the Slack channel. The first check only records the
            current items and posts nothing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feed_name">Name</Label>
            <Input id="feed_name" placeholder="WhatsApp changelog" {...register('name', { required: 'Name is required.' })} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feed_url">Feed URL</Label>
            <Input
              id="feed_url"
              type="url"
              placeholder="https://example.com/rss"
              {...register('feed_url', {
                required: 'Feed URL is required.',
                pattern: { value: /^https?:\/\/\S+$/i, message: 'Must be an http(s) URL.' },
              })}
            />
            {errors.feed_url && <p className="text-destructive text-xs">{errors.feed_url.message}</p>}
            {isEdit && (
              <p className="text-muted-foreground text-xs">
                Changing the URL starts over: the next check only records the current items.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slack_channel">Slack Channel</Label>
            <Input
              id="slack_channel"
              placeholder="#whatsapp-changelog"
              {...register('slack_channel', {
                required: 'Slack channel is required.',
                pattern: { value: /^[#@]?[\w.-]+$/, message: 'Use a channel name like #general.' },
              })}
            />
            {errors.slack_channel && <p className="text-destructive text-xs">{errors.slack_channel.message}</p>}
            <p className="text-muted-foreground text-xs">The ChatReach Slack bot must be invited to this channel.</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="feed_enabled" checked={enabled} onCheckedChange={(checked) => setValue('enabled', !!checked)} />
            <Label htmlFor="feed_enabled">Enabled</Label>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Feed Watcher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
