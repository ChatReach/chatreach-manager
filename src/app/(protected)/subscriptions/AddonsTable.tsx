'use client';

import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { SubscriptionAddon } from '@/api/admin/subscriptions/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { humanize } from './labels';

const formatEuros = (amount: number | null) =>
  amount === null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

function StripeLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return <span className="text-muted-foreground text-xs">{label}: —</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
    >
      {label} in Stripe
      <ExternalLink className="size-3" />
    </a>
  );
}

interface Props {
  addons: SubscriptionAddon[];
  emptyLabel: string;
  onEdit: (addon: SubscriptionAddon) => void;
  onDelete: (addon: SubscriptionAddon) => void;
}

export function AddonsTable({ addons, emptyLabel, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sells</TableHead>
            <TableHead className="text-right">Per Unit</TableHead>
            <TableHead className="text-right">Max</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stripe</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {addons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground text-center text-sm">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            addons.map((addon) => {
              const isFeature = addon.plan_feature !== null;

              return (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {humanize(addon.type)}
                      {isFeature && <Badge variant="outline">Feature</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{isFeature ? '—' : addon.amount_per_unit}</TableCell>
                  <TableCell className="text-right">{isFeature ? '—' : addon.max_quantity}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    <div className="flex flex-col">
                      <span>{formatEuros(addon.monthly_price)} / mo</span>
                      <span>{formatEuros(addon.annual_price)} / yr</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {addon.is_active ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <StripeLink label="Monthly" url={addon.stripe_monthly_url} />
                      <StripeLink label="Annual" url={addon.stripe_annual_url} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(addon)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(addon)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
