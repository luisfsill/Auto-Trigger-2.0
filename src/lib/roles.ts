import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types.gen';

export type UserRole = 'admin' | 'user';
type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];

/**
 * Verifica o role do usuário atual
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default role
  }

  return (data as UserRoleRow).role;
}

/**
 * Verifica se o usuário atual é admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin';
}

/**
 * Verifica o role de um usuário específico pelo ID
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default role
  }

  return (data as UserRoleRow).role;
}
