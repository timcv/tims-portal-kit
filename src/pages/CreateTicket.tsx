import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const ticketFormSchema = z.object({
  subject: z.string().min(1, 'Ämne krävs'),
  type: z.enum(['Support', 'Economy', 'Other']),
  description: z.string().min(1, 'Beskrivning krävs'),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = 'Skapa ärende – Kundportal';
    const desc = document.querySelector('meta[name="description"]');
    const content = 'Skapa nytt ärende med ämne, typ och beskrivning.';
    if (desc) desc.setAttribute('content', content);
    else {
      const m = document.createElement('meta');
      (m as HTMLMetaElement).name = 'description';
      m.setAttribute('content', content);
      document.head.appendChild(m);
    }
  }, []);
  
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      type: 'Support',
      description: '',
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    if (!session?.user?.id) {
      toast({
        title: 'Fel',
        description: 'Du måste vara inloggad för att skapa ett ärende.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: account_id, error: accountErr } = await supabase.rpc('get_user_account', {
        _user_id: session.user.id,
      });
      if (accountErr) throw accountErr;

      if (!account_id) {
        toast({
          title: 'Ingen konto-koppling',
          description: 'Din profil saknar kopplat konto. Kontakta administratör.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('tickets')
        .insert({
          title: values.subject,
          type: values.type,
          description: values.description,
          account_id,
          created_by: session.user.id,
          status: 'open',
          priority: 3,
        });

      if (error) throw error;

      toast({
        title: 'Ärende skapat',
        description: 'Ditt ärende har skapats framgångsrikt.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte skapa ärendet. Försök igen.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary-glow/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Skapa nytt ärende</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ämne</FormLabel>
                      <FormControl>
                        <Input placeholder="Beskriv ditt ärende kort..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Välj typ av ärende" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Economy">Economy</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beskrivning</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Beskriv ditt ärende i detalj..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Avbryt
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={form.formState.isSubmitting}
                    className="flex-1"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Skapar...
                      </>
                    ) : (
                      'Skapa ärende'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}