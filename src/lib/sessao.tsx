import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Estado = { session: Session | null; carregando: boolean };
const Ctx = createContext<Estado>({ session: null, carregando: true });

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ session: null, carregando: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEstado({ session: data.session, carregando: false }));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setEstado({ session, carregando: false }));
    return () => data.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>;
}

export const useSessao = () => useContext(Ctx);
