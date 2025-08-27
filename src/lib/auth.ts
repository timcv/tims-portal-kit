import { supabase } from "@/integrations/supabase/client";
import { AppRole, Profile, UserRole } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
  roles: UserRole[];
}

export class AuthService {
  static async signUp(email: string, password: string, metadata?: { first_name?: string; last_name?: string }) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get user profile and roles
    const [profileResult, rolesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
    ]);

    return {
      id: user.id,
      email: user.email!,
      profile: profileResult.data || undefined,
      roles: rolesResult.data || []
    };
  }

  static async hasRole(userId: string, accountId: string, role: AppRole): Promise<boolean> {
    const { data } = await supabase.rpc('has_role', {
      _user_id: userId,
      _account_id: accountId,
      _role: role
    });
    
    return Boolean(data);
  }

  static async isSuperAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase.rpc('is_super_admin', {
      _user_id: userId
    });
    
    return Boolean(data);
  }

  static async getUserAccount(userId: string): Promise<string | null> {
    const { data } = await supabase.rpc('get_user_account', {
      _user_id: userId
    });
    
    return data;
  }

  static async createProfile(userId: string, accountId: string, email: string, data?: { first_name?: string; last_name?: string }) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        account_id: accountId,
        email,
        first_name: data?.first_name,
        last_name: data?.last_name
      })
      .select()
      .single();

    return { profile, error };
  }

  static async assignRole(userId: string, accountId: string, role: AppRole, grantedBy: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        account_id: accountId,
        role,
        granted_by: grantedBy
      })
      .select()
      .single();

    return { data, error };
  }
}