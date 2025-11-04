import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Função para verificar se o usuário é admin
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('🔍 Verificando status de admin para:', userId);
      
      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao verificar role')), 5000)
      );
      
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.log('❌ Erro ao buscar role:', error);
        setIsAdmin(false);
        return;
      }
      
      if (!data) {
        console.log('❌ Sem dados de role');
        setIsAdmin(false);
        return;
      }

      console.log('✅ Role encontrada:', data.role);
      setIsAdmin(data.role === 'admin');
    } catch (error) {
      console.error('❌ Erro crítico ao verificar admin:', error);
      setIsAdmin(false);
    }
  };

  // Setup inicial e listener de mudanças
  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Erro ao obter sessão inicial:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Verificar status de admin se já houver sessão
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      }
      
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de auth:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Verificar status de admin quando o usuário fizer login
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
          },
        },
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  // Função para logout
  const signOut = useCallback(async (): Promise<void> => {
    try {
      console.log('🔓 Executando logout...');
      
      // Limpar estados primeiro
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      
      // Limpar storage manualmente
      localStorage.removeItem('sb-xtlcnppdnlvxlfjdxqzk-auth-token');
      
      // Executar signOut do Supabase (sem await para não travar)
      supabase.auth.signOut().catch(err => {
        console.error('Erro no signOut (ignorado):', err);
      });
      
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, limpar tudo
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      localStorage.removeItem('sb-xtlcnppdnlvxlfjdxqzk-auth-token');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
