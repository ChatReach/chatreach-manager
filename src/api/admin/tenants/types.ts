export interface TenantOwner {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface Tenant {
  id: string;
  reference: string;
  name: string;
  is_personal: boolean;
  owner: TenantOwner;
  stripe_id: string | null;
  subscription_plan: string | null;
  is_on_trial: boolean;
  trial_ends_at: string | null;
  monthly_spending_limit: number | null;
  has_exceeded_spending_limit: boolean;
  users_count: number;
  campaigns_count: number;
  workflows_count: number;
  contacts_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTenantPayload {
  name: string;
  is_personal?: boolean;
  trial_days?: number;
  owner_id?: string;
  owner?: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface TenantsResponse {
  data: Tenant[];
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
