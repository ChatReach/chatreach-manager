'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JsonViewer({
  value,
  emptyText = 'No data',
}: {
  value: unknown;
  emptyText?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined) {
    return <p className="text-muted-foreground text-sm">{emptyText}</p>;
  }

  const formatted = JSON.stringify(value, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-muted/40 relative rounded-md border">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 size-7"
        onClick={handleCopy}
        aria-label="Copy JSON"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
      <pre className="max-h-96 overflow-auto p-4 pr-10 text-xs leading-relaxed break-all whitespace-pre-wrap">
        {formatted}
      </pre>
    </div>
  );
}
