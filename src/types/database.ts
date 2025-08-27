export type AppRole = 'super_admin' | 'account_admin' | 'account_user';
export type AccountStatus = 'active' | 'suspended' | 'pending';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Account {
  id: string;
  name: string;
  slug: string;
  status: AccountStatus;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  account_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  account_id: string;
  role: AppRole;
  granted_by: string | null;
  granted_at: string;
}

export interface Invitation {
  id: string;
  account_id: string;
  email: string;
  role: AppRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  account_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  account_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  metadata: Record<string, any>;
  created_at: string;
}