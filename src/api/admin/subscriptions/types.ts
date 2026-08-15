export const PLAN_LIMITS = [
  'phone_numbers',
  'members',
  'contacts',
  'workflows',
  'flows',
] as const;

export type PlanLimit = (typeof PLAN_LIMITS)[number];

export const PLAN_FEATURES = [
  'multi_team_inbox',
  'campaign_analytics',
  'team_analytics',
  'advanced_analytics',
  'shopify',
  'webhooks',
  'api_access',
] as const;

export type PlanFeature = (typeof PLAN_FEATURES)[number];

export type BillingInterval = 'monthly' | 'annual';

export interface SubscriptionAddon {
  id: string;
  subscription_plan_id: string;
  plan_limit: PlanLimit;
  amount_per_unit: number;
  max_quantity: number;
  is_active: boolean;
  monthly_price: number | null;
  annual_price: number | null;
  stripe_monthly_price_id: string | null;
  stripe_annual_price_id: string | null;
  stripe_monthly_url: string | null;
  stripe_annual_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  monthly_price: number | null;
  annual_price: number | null;
  limits: Partial<Record<PlanLimit, number>>;
  features: Partial<Record<PlanFeature, boolean>>;
  stripe_monthly_price_id: string | null;
  stripe_annual_price_id: string | null;
  stripe_monthly_url: string | null;
  stripe_annual_url: string | null;
  addons: SubscriptionAddon[];
  created_at: string;
  updated_at: string;
}

export interface PlanPayload {
  name: string;
  slug: string;
  is_active: boolean;
  is_public: boolean;
  sort_order?: number;
  monthly_price?: number | null;
  annual_price?: number | null;
  stripe_monthly_price_id?: string | null;
  stripe_annual_price_id?: string | null;
  limits?: Partial<Record<PlanLimit, number>>;
  features?: Partial<Record<PlanFeature, boolean>>;
}

export interface AddonPayload {
  plan_limit: PlanLimit;
  amount_per_unit: number;
  max_quantity: number;
  is_active: boolean;
  monthly_price?: number | null;
  annual_price?: number | null;
  stripe_monthly_price_id?: string | null;
  stripe_annual_price_id?: string | null;
}

export interface TenantSubscriptionAddon {
  plan_limit: PlanLimit;
  quantity: number;
  price: number | null;
}

export interface TenantSubscription {
  plan: { name: string; slug: string } | null;
  price: number | null;
  interval: BillingInterval | null;
  ends_at: string | null;
  subscribed_at: string | null;
  addons: TenantSubscriptionAddon[];
}

export interface TenantSubscriptionState {
  subscribed: boolean;
  on_trial: boolean;
  trial_ends_at: string | null;
  canceled: boolean;
  on_grace_period: boolean;
  ended: boolean;
  subscription: TenantSubscription | null;
}

export interface StartSubscriptionResponse {
  url: string;
}

export interface SwapPayload {
  plan: string;
  interval: BillingInterval;
}

export interface AddonQuantityPayload {
  type: PlanLimit;
  quantity: number;
}
