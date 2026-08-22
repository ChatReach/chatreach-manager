export interface AdminUserTenant {
  id: string;
  name: string;
  role: string | null;
}

export interface AdminUser {
  id: string;
  firstname: string;
  email: string;
  is_admin: boolean;
  profile_photo_url?: string;
  created_at: string;

  /** The user themselves grants support access; it unlocks impersonation. */
  support_access_enabled: boolean;
  support_access_until?: string | null;

  tenants_count?: number;
  /** Only loaded on the show endpoint. */
  tenants?: AdminUserTenant[];

  // Only returned by the show endpoint; listings stay minimal.
  email_verified_at?: string | null;
  marketing_unsubscribed_at?: string | null;
  two_factor_enabled?: boolean;
  updated_at?: string;
  last_activity_at?: string | null;
}

/** Served only by the personal-data endpoint, which audit-logs every read. */
export interface UserPersonalData {
  lastname: string;
  name: string;
  phone_number: string | null;
}

export interface UpdateUserPayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone_number?: string | null;
  /** True keeps the user subscribed; false stamps marketing_unsubscribed_at. */
  marketing_emails?: boolean;
}

export interface AdminUsersResponse {
  data: AdminUser[];
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
