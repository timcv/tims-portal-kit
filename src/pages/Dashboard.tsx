import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Settings, 
  Users, 
  Ticket, 
  BarChart3, 
  Plus,
  Shield,
  Building2,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut, isSuperAdmin, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Utloggad',
        description: 'Du har loggats ut framgångsrikt.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ett fel uppstod',
        description: 'Kunde inte logga ut. Försök igen.',
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Superadministratör';
      case 'account_admin':
        return 'Kontoadministratör';
      case 'account_user':
        return 'Användare';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'account_admin':
        return 'default';
      case 'account_user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Åtkomst nekad</CardTitle>
            <CardDescription>Du måste logga in för att komma åt denna sida.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5">
      {/* Header */}
      <header className="bg-primary shadow-primary border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground text-sm font-bold">H</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-primary-foreground">Hemglass Portal</h1>
                <p className="text-sm text-primary-foreground/80">Kundportal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-primary-foreground">
                  {user.profile?.first_name} {user.profile?.last_name}
                </p>
                <p className="text-xs text-primary-foreground/80">{user.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logga ut
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Välkommen, {user.profile?.first_name || 'Användare'}!
          </h2>
          <p className="text-muted-foreground">
            Här är din översikt av kundportalen.
          </p>
        </div>

        {/* User Roles */}
        {user.roles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Dina roller
              </CardTitle>
              <CardDescription>
                Du har följande behörigheter i systemet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <Badge 
                    key={index} 
                    variant={getRoleBadgeVariant(role.role) as any}
                    className="flex items-center gap-1"
                  >
                    {role.role === 'super_admin' && <Shield className="h-3 w-3" />}
                    {role.role === 'account_admin' && <Building2 className="h-3 w-3" />}
                    {role.role === 'account_user' && <UserCheck className="h-3 w-3" />}
                    {getRoleDisplayName(role.role)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-accent" />
                Mina ärenden
              </CardTitle>
              <CardDescription>
                Skapa och hantera supportärenden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="accent" 
                className="w-full"
                onClick={() => navigate('/create-ticket')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Skapa nytt ärende
              </Button>
            </CardContent>
          </Card>

          {(isSuperAdmin() || (user.profile?.account_id && hasRole(user.profile.account_id, 'account_admin'))) && (
            <Card className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Användarhantering
                </CardTitle>
                <CardDescription>
                  Hantera användare och roller
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Hantera användare
                </Button>
              </CardContent>
            </Card>
          )}

          {isSuperAdmin() && (
            <Card className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-success" />
                  Systemöversikt
                </CardTitle>
                <CardDescription>
                  Superadmin kontrollpanel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktiva ärenden
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Inga öppna ärenden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kontostatus
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Aktiv</div>
              <p className="text-xs text-muted-foreground">
                Allt fungerar som det ska
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Språk
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.profile?.locale === 'sv' ? '🇸🇪' : '🇬🇧'}</div>
              <p className="text-xs text-muted-foreground">
                {user.profile?.locale === 'sv' ? 'Svenska' : 'English'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground">
            Hemglass Kundportal - {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;