import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(6, 'Lösenordet måste vara minst 6 tecken'),
});

const signUpSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(6, 'Lösenordet måste vara minst 6 tecken'),
  confirmPassword: z.string().min(6, 'Bekräfta lösenordet'),
  firstName: z.string().min(2, 'Förnamn krävs'),
  lastName: z.string().min(2, 'Efternamn krävs'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Lösenorden matchar inte",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  }, [user, authLoading, navigate, searchParams]);

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: 'destructive',
            title: 'Inloggning misslyckades',
            description: 'Ogiltig e-postadress eller lösenord.',
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            variant: 'destructive',
            title: 'Bekräfta din e-post',
            description: 'Vänligen bekräfta din e-postadress innan du loggar in.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Ett fel uppstod',
            description: error.message || 'Kunde inte logga in. Försök igen.',
          });
        }
      } else {
        toast({
          title: 'Välkommen!',
          description: 'Du har loggats in framgångsrikt.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ett fel uppstod',
        description: 'Kunde inte logga in. Försök igen.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            variant: 'destructive',
            title: 'Användaren finns redan',
            description: 'En användare med denna e-postadress finns redan. Försök logga in istället.',
          });
          setActiveTab('signin');
        } else {
          toast({
            variant: 'destructive',
            title: 'Registrering misslyckades',
            description: error.message || 'Kunde inte skapa konto. Försök igen.',
          });
        }
      } else {
        toast({
          title: 'Konto skapat!',
          description: 'Bekräfta din e-postadress för att aktivera ditt konto.',
        });
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ett fel uppstod',
        description: 'Kunde inte skapa konto. Försök igen.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-2xl font-bold">H</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Hemglass Portal</CardTitle>
            <CardDescription className="text-muted-foreground">
              Logga in för att komma åt din kundportal
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Logga in</TabsTrigger>
              <TabsTrigger value="signup">Registrera</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-postadress</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="din@email.se"
                      className="pl-10"
                      {...signInForm.register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Lösenord</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Ange ditt lösenord"
                      className="pl-10"
                      {...signInForm.register('password')}
                      disabled={isLoading}
                    />
                  </div>
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full" 
                  disabled={isLoading}
                  aria-label="Logga in på ditt konto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loggar in...
                    </>
                  ) : (
                    'Logga in'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstName">Förnamn</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-firstName"
                        placeholder="Anna"
                        className="pl-10"
                        {...signUpForm.register('firstName')}
                        disabled={isLoading}
                      />
                    </div>
                    {signUpForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {signUpForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastName">Efternamn</Label>
                    <Input
                      id="signup-lastName"
                      placeholder="Andersson"
                      {...signUpForm.register('lastName')}
                      disabled={isLoading}
                    />
                    {signUpForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {signUpForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-postadress</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="din@email.se"
                      className="pl-10"
                      {...signUpForm.register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Lösenord</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minst 6 tecken"
                      className="pl-10"
                      {...signUpForm.register('password')}
                      disabled={isLoading}
                    />
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirmPassword">Bekräfta lösenord</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirmPassword"
                      type="password"
                      placeholder="Upprepa lösenordet"
                      className="pl-10"
                      {...signUpForm.register('confirmPassword')}
                      disabled={isLoading}
                    />
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full" 
                  disabled={isLoading}
                  aria-label="Skapa nytt konto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Skapar konto...
                    </>
                  ) : (
                    'Skapa konto'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Alert className="border-accent/20 bg-accent/5">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                För testing: Bekräfta e-post är avstängt i utvecklingsläge
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;