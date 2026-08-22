'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RevealGateProps<T> {
  label: string;
  description?: string;
  load: () => Promise<T>;
  children: (data: T) => React.ReactNode;
}

/**
 * Hides sensitive data until staff explicitly ask for it. The `load` call is what
 * actually fetches the data, and the API audit-logs that read against the admin.
 */
export function RevealGate<T>({ label, description, load, children }: RevealGateProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data) {
    return <>{children(data)}</>;
  }

  const reveal = () => {
    setLoading(true);
    setError(null);

    load()
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      <Button variant="outline" size="sm" onClick={reveal} disabled={loading}>
        <Eye className="size-4" />
        {loading ? 'Loading…' : label}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
