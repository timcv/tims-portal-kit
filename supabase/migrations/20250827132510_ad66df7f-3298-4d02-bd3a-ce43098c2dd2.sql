-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'account_admin', 'account_user');

-- Create account status enum  
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'pending');

-- Create ticket status enum
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Create accounts table (multi-tenant)
CREATE TABLE public.accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status account_status NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table with account association
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'sv',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, account_id)
);

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, account_id, role)
);

-- Create invitations table
CREATE TABLE public.invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role app_role NOT NULL,
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create tickets table
CREATE TABLE public.tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status ticket_status NOT NULL DEFAULT 'open',
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_attachments table
CREATE TABLE public.ticket_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _account_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id 
        AND account_id = _account_id 
        AND role = _role
    )
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id 
        AND role = 'super_admin'
    )
$$;

-- Create function to get user account
CREATE OR REPLACE FUNCTION public.get_user_account(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT account_id FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- RLS Policies for accounts
CREATE POLICY "Super admins can manage all accounts" ON public.accounts
    FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their account" ON public.accounts
    FOR SELECT USING (
        id = public.get_user_account(auth.uid())
    );

-- RLS Policies for profiles
CREATE POLICY "Super admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view profiles in their account" ON public.profiles
    FOR SELECT USING (
        account_id = public.get_user_account(auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Account admins can manage roles in their account" ON public.user_roles
    FOR ALL USING (
        public.has_role(auth.uid(), account_id, 'account_admin')
    );

CREATE POLICY "Users can view roles in their account" ON public.user_roles
    FOR SELECT USING (
        account_id = public.get_user_account(auth.uid())
    );

-- RLS Policies for invitations
CREATE POLICY "Super admins can manage all invitations" ON public.invitations
    FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Account admins can manage invitations in their account" ON public.invitations
    FOR ALL USING (
        public.has_role(auth.uid(), account_id, 'account_admin')
    );

-- RLS Policies for tickets
CREATE POLICY "Super admins can manage all tickets" ON public.tickets
    FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Account admins can manage tickets in their account" ON public.tickets
    FOR ALL USING (
        public.has_role(auth.uid(), account_id, 'account_admin')
    );

CREATE POLICY "Users can manage their own tickets" ON public.tickets
    FOR ALL USING (
        created_by = auth.uid() OR 
        (account_id = public.get_user_account(auth.uid()) AND assigned_to = auth.uid())
    );

-- RLS Policies for ticket_attachments
CREATE POLICY "Super admins can manage all attachments" ON public.ticket_attachments
    FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can manage attachments for accessible tickets" ON public.ticket_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                t.created_by = auth.uid() OR
                t.assigned_to = auth.uid() OR
                public.has_role(auth.uid(), t.account_id, 'account_admin')
            )
        )
    );

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Account admins can view logs in their account" ON public.audit_logs
    FOR SELECT USING (
        public.has_role(auth.uid(), account_id, 'account_admin')
    );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This will be called when a user signs up
    -- Additional profile creation logic can be added here
    RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo data
INSERT INTO public.accounts (name, slug, status) VALUES 
    ('Hemglass Demo AB', 'hemglass-demo', 'active'),
    ('Test Account', 'test-account', 'active');

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('ticket-attachments', 'ticket-attachments', false);

-- Storage policies for ticket attachments
CREATE POLICY "Users can upload attachments for their tickets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'ticket-attachments' AND
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE auth.uid() IN (t.created_by, t.assigned_to)
            OR public.has_role(auth.uid(), t.account_id, 'account_admin')
            OR public.is_super_admin(auth.uid())
        )
    );

CREATE POLICY "Users can view attachments for accessible tickets" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'ticket-attachments' AND
        EXISTS (
            SELECT 1 FROM public.ticket_attachments ta
            JOIN public.tickets t ON ta.ticket_id = t.id
            WHERE ta.file_path = name
            AND (
                t.created_by = auth.uid() OR
                t.assigned_to = auth.uid() OR
                public.has_role(auth.uid(), t.account_id, 'account_admin') OR
                public.is_super_admin(auth.uid())
            )
        )
    );