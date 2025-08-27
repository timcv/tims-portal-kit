import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requiresSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiresSuperAdmin = false,
}) => {
  const { user, loading, isSuperAdmin, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiresSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && user.profile?.account_id && !hasRole(user.profile.account_id, requiredRole) && !isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};