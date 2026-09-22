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
  'touchpoint_widgets',
  'zapier',
  'remove_touchpoint_widget_branding',
] as const;

export type PlanFeature = (typeof PLAN_FEATURES)[number];

/** An addon sells either extra units of a limit or a single feature. */
export type AddonType = PlanLimit | PlanFeature;

export type BillingInterval = 'monthly' | 'annual';

export interface SubscriptionAddon {
  id: string;
  /** Null when the addon is sold on top of any plan. */
  subscription_plan_id: string | null;
  type: AddonType;
  plan_limit: PlanLimit | null;
  plan_feature: PlanFeature | null;
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
  description: string | null;
  is_active: boolean;
  is_public: boolean;
  is_popular: boolean;
  is_trial: boolean;
  sort_order: number;
  monthly_price: number | null;
  annual_price: number | null;
  limits: Partial<Record<PlanLimit, number>>;
  features: Partial<Record<PlanFeature, boolean>>;
  stripe_monthly_price_id: string | null;
  stripe_annual_price_id: string | null;
  stripe_monthly_url: string | null;
  stripe_annual_url: string | null;
  shopify_plan_handle: string | null;
  addons: SubscriptionAddon[];
  created_at: string;
  updated_at: string;
}

export interface PlanPayload {
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  is_public: boolean;
  is_popular: boolean;
  is_trial: boolean;
  sort_order?: number;
  monthly_price?: number | null;
  annual_price?: number | null;
  stripe_monthly_price_id?: string | null;
  stripe_annual_price_id?: string | null;
  shopify_plan_handle?: string | null;
  limits?: Partial<Record<PlanLimit, number>>;
  features?: Partial<Record<PlanFeature, boolean>>;
}

export interface AddonPayload {
  plan_limit?: PlanLimit | null;
  plan_feature?: PlanFeature | null;
  amount_per_unit: number;
  max_quantity: number;
  is_active: boolean;
  monthly_price?: number | null;
  annual_price?: number | null;
  stripe_monthly_price_id?: string | null;
  stripe_annual_price_id?: string | null;
}

export interface TenantSubscriptionAddon {
  type: AddonType;
  plan_limit: PlanLimit | null;
  plan_feature: PlanFeature | null;
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
  /** Null when the plan is free: the subscription is active straight away, without Checkout. */
  url: string | null;
}

export interface SwapPayload {
  plan: string;
  interval: BillingInterval;
}

export interface AddonQuantityPayload {
  type: AddonType;
  /** Feature addons are a toggle, so they are bought and removed without a quantity. */
  quantity?: number;
}
