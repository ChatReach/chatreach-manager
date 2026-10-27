import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import type { FeedWatcher, FeedWatcherPayload } from './types';

export const getFeedWatchers = () => fetchClient<FeedWatcher[]>(API_ROUTES.ADMIN.FEED_WATCHERS);

export const createFeedWatcher = (data: FeedWatcherPayload) =>
  fetchClient<FeedWatcher>(API_ROUTES.ADMIN.FEED_WATCHERS, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateFeedWatcher = (id: string, data: Partial<FeedWatcherPayload>) =>
  fetchClient<FeedWatcher>(API_ROUTES.ADMIN.FEED_WATCHER(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteFeedWatcher = (id: string) =>
  fetchClient<void>(API_ROUTES.ADMIN.FEED_WATCHER(id), { method: 'DELETE' });
