'use client';

import { use, useEffect, useState } from 'react';
import { getSubscriptionPlan } from '@/api/admin/subscriptions';
import type { SubscriptionPlan } from '@/api/admin/subscriptions/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanForm } from '../../PlanForm';

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionPlan(id)
      .then(setPlan)
      .catch((err) => setError(err.message ?? 'Failed to load plan.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !plan) {
    return <p className="text-destructive text-sm">{error ?? 'Plan not found.'}</p>;
  }

  return <PlanForm plan={plan} />;
}
