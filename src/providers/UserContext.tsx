'use client';

import { User } from '@/api/auth/types';
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
    const checkUser = async () => {
      try {
        const data = await getUser();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
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
