'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateBusinessAccountSpendingLimit } from '@/api/admin/tenants';
import type { TenantBusinessAccount } from '@/api/admin/tenants/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Props {
  tenantId: string;
  businessAccounts: TenantBusinessAccount[];
  onChanged: () => void;
}

const formatMoney = (amount: number, currency: string | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'EUR' }).format(amount);

function SpendingLimitRow({
  tenantId,
  businessAccount,
  onChanged,
}: {
  tenantId: string;
  businessAccount: TenantBusinessAccount;
  onChanged: () => void;
}) {
  const [limit, setLimit] = useState(
    businessAccount.monthly_spending_limit != null ? String(businessAccount.monthly_spending_limit) : '',
  );
  const [busy, setBusy] = useState(false);
  const nextLimit = limit.trim() === '' ? null : Number(limit);
  const isChanged = nextLimit !== businessAccount.monthly_spending_limit;

  const save = async () => {
    setBusy(true);
    try {
      await updateBusinessAccountSpendingLimit(tenantId, businessAccount.id, nextLimit);
      toast.success('Spending limit updated.');
      onChanged();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update the spending limit.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{businessAccount.name ?? '—'}</div>
        <div className="text-muted-foreground text-xs">{businessAccount.messaging_account_id}</div>
      </TableCell>
      <TableCell>
        {formatMoney(businessAccount.current_month_spending, businessAccount.currency)}
        {businessAccount.has_exceeded_spending_limit && (
          <Badge variant="destructive" className="ml-2">
            Limit reached
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{businessAccount.currency ?? '—'}</span>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="No limit"
            className="h-8 w-32"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            aria-label={`Monthly spending limit of ${businessAccount.name ?? businessAccount.messaging_account_id}`}
          />
          <Button size="sm" variant="outline" disabled={busy || !isChanged} onClick={save}>
            Save
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BusinessAccountSpendingCard({ tenantId, businessAccounts, onChanged }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">WhatsApp spending limits</CardTitle>
      </CardHeader>
      <CardContent>
        {businessAccounts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No WhatsApp Business Accounts connected.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WhatsApp Business Account</TableHead>
                <TableHead>Spent this month</TableHead>
                <TableHead>Monthly limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessAccounts.map((businessAccount) => (
                <SpendingLimitRow
                  key={`${businessAccount.id}-${businessAccount.monthly_spending_limit}`}
                  tenantId={tenantId}
                  businessAccount={businessAccount}
                  onChanged={onChanged}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
