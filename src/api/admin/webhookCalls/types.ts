export interface WebhookCallException {
  code: number | string;
  message: string;
  trace: string;
}

export interface WebhookCall {
  id: string;
  name: string;
  url: string;
  payload: Record<string, unknown> | null;
  headers: Record<string, unknown> | null;
  exception: WebhookCallException | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookCallsResponse {
  data: WebhookCall[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
