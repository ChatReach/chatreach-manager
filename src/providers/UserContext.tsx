'use client';

import { User } from '@/api/auth/types';
import { NetworkError } from '@/api/fetchClient';
import { getUser } from '@/api/auth/user';
import { COOKIES } from '@/constants/storage';
import { deleteCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useEffect, useState } from 'react';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let retryTimer: number | undefined;
    const checkUser = async () => {
      let retrying = false;
      try {
        const data = await getUser();
        setUser(data);
      } catch (err) {
        // Unreachable API is not a logout: keep the session cookie and retry.
        if (err instanceof NetworkError) {
          retrying = true;
          retryTimer = window.setTimeout(checkUser, 5000);
          return;
        }
        setUser(null);
      } finally {
        // Stay in the loading state while retrying so route guards don't treat us as logged out.
        if (!retrying) setLoading(false);
      }
    };

    checkUser();
    return () => window.clearTimeout(retryTimer);
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);

    if (newUser) {
      setCookie(COOKIES.USER, JSON.stringify(newUser));
    } else {
      deleteCookie(COOKIES.USER);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};
