import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, UserPlus, Shield, Building2, Headphones } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-hero">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="space-y-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-3xl font-bold">H</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-bold text-white">
                  Hemglass Portal
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto">
                  Välkommen till din kundportal. Hantera ärenden, följ upp ordrar och få hjälp när du behöver det.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  aria-label="Logga in på ditt konto"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Logga in
                </Button>
                <Button 
                  variant="accent" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="shadow-accent"
                  aria-label="Skapa nytt konto"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Skapa konto
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Allt du behöver på ett ställe
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vår kundportal ger dig full kontroll över dina ärenden och kommunikation med oss.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Få hjälp när du behöver det. Skapa ärenden och få snabb respons från vårt supportteam.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Företagslösningar</CardTitle>
                <CardDescription>
                  Hantera flera användare och konton med våra avancerade administrativa verktyg.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-success-foreground" />
                </div>
                <CardTitle>Säker & Trygg</CardTitle>
                <CardDescription>
                  Dina data är säkra med oss. Vi använder de senaste säkerhetsstandarderna för att skydda din information.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Kom igång idag
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Registrera dig nu och få tillgång till alla funktioner i vår kundportal.
            </p>
            <Button 
              variant="accent" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="shadow-accent"
              aria-label="Kom igång med Hemglass Portal"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Kom igång
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">H</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Hemglass Portal. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
