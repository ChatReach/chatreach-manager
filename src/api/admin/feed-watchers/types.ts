export interface FeedWatcher {
  id: string;
  name: string;
  feed_url: string;
  slack_channel: string;
  enabled: boolean;
  last_checked_at: string | null;
  last_error: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FeedWatcherPayload {
  name: string;
  feed_url: string;
  slack_channel: string;
  enabled: boolean;
}
