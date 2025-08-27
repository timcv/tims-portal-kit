-- Fix function search path security warnings by setting search_path
ALTER FUNCTION public.has_role(_user_id UUID, _account_id UUID, _role app_role) 
SET search_path = public;

ALTER FUNCTION public.is_super_admin(_user_id UUID) 
SET search_path = public;

ALTER FUNCTION public.get_user_account(_user_id UUID) 
SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public;