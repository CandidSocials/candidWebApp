import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

export interface JobListing {
  id: string;
  title: string;
  company_name: string;
  description: string;
  budget: number;
  status: string;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  status: string;
  proposal?: string;
  created_at: string;
  job: JobListing;
}

export function useMyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            *,
            job_listings!job_id(
              id,
              title,
              description,
              budget,
              status,
              user_profiles!business_id(
                company_name
              )
            )
          `)
          .eq('freelancer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformar los datos para incluir company_name en el nivel correcto
        const transformedData = (data || []).map(app => ({
          ...app,
          job: {
            ...app.job_listings,
            company_name: app.job_listings?.user_profiles?.company_name
          }
        }));

        setApplications(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err as Error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('my_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `freelancer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Cambio detectado en aplicaciones:', payload);
          fetchApplications();
        }
      )
      .subscribe();

    fetchApplications();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { applications, loading, error };
}
