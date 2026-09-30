'use client';

import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import { Button } from '@/components/ui/button';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import { markOnline } from '@/lib/connectivity';
import { Loader2, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

// Persistent, non-dismissible: it only goes away once the connection is back.
export default function OfflineScreen() {
  const { browserOnline } = useOnlineStatus();
  const [checking, setChecking] = useState(false);

  // Lock scrolling behind the overlay while offline.
  useEffect(() => {
    if (browserOnline) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [browserOnline]);

  // Some browsers never fire `online`, so re-check periodically while offline.
  useEffect(() => {
    if (browserOnline) return;
    const id = window.setInterval(() => {
      if (navigator.onLine) markOnline();
    }, 5000);
    return () => window.clearInterval(id);
  }, [browserOnline]);

  if (browserOnline) return null;

  const recheck = async () => {
    setChecking(true);
    try {
      await fetchClient(API_ROUTES.AUTH.USER);
      markOnline();
    } catch (err) {
      // An HTTP error (e.g. 401) still proves we reached the server.
      if (err instanceof Error && err.name === 'ApiError') markOnline();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="offline-title"
        aria-describedby="offline-description"
        className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-xl"
      >
        <WifiOff className="size-10 text-muted-foreground" aria-hidden />
        <h1 id="offline-title" className="text-xl font-semibold text-foreground">
          You&apos;re offline
        </h1>
        <p id="offline-description" className="text-muted-foreground">
          Check your internet connection. Your work is safe: we&apos;ll reconnect automatically and you can pick up
          right where you left off.
        </p>
        <Button variant="outline" onClick={recheck} disabled={checking}>
          {checking && <Loader2 className="animate-spin" />}
          Try again
        </Button>
      </div>
    </div>
  );
}
