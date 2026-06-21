import { getPusherSocketId } from '@/lib/pusher';
import { getXsrfToken, getXTenant } from './cookies';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface FetchOptions extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
  headers?: Record<string, string>;
  baseUrl?: string;
}

export const fetchClient = async <T = unknown>(url: string, options: FetchOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    params,
    headers = {},
    baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || '',
    body,
    ...rest
  } = options;

  const fullUrl = buildUrl(`${baseUrl}${url}`, params);
  const xsrfToken = await getXsrfToken();
  const xTenant = await getXTenant();
  const socketId = getPusherSocketId();

  const isFormData = body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'X-Tenant': xTenant,
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN': xsrfToken,
    ...headers,
  };

  if (socketId) {
    requestHeaders['X-Socket-Id'] = socketId;
  }

  const res = await fetch(fullUrl, {
    method,
    credentials: 'include',
    headers: requestHeaders,
    body,
    ...rest,
  });

  if (!res.ok) {
    const errorBody = await safeJson(res);
    throw new ApiError((errorBody && errorBody.message) || `Request failed with status ${res.status}`, res.status);
  }

  return safeJson(res);
};

const buildUrl = (url: string, params?: Record<string, string | number | boolean | null | undefined>): string => {
  if (!params) return url;

  const query = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value === undefined || value === null || value === '') {
          return acc;
        }

        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  return `${url}?${query.toString()}`;
};

const safeJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};
