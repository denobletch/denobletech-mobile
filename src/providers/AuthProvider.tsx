import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';

type AuthState = { user: User | null; loading: boolean };
const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const client = supabase;
    client.auth.getUser().then(({ data }) => {
      if (active) { setUser(data.user); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') setUser(null);
      else if (session?.user) setUser(session.user);
      setLoading(false);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
