import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { JobApplication } from '../lib/types';
import { useAuth } from '../lib/AuthProvider';

export function useJobApplication(jobId: string) {
  const { user } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !jobId) return;

    const fetchApplication = async () => {
      try {
        // Primero obtenemos la aplicación básica
        const { data: appData, error: appError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('job_id', jobId)
          .eq('freelancer_id', user?.id)
          .maybeSingle();

        if (appError) throw appError;

        if (appData) {
          // Luego obtenemos los detalles del trabajo y la empresa
          const { data: jobData, error: jobError } = await supabase
            .from('job_listings')
            .select(`
              id,
              title,
              description,
              budget,
              location,
              category,
              skills_required,
              status,
              business_id,
              business:user_profiles (
                full_name,
                company_name
              )
            `)
            .eq('id', jobId)
            .single();

          if (jobError) throw jobError;

          // Combinamos los datos
          setApplication({
            ...appData,
            job: jobData
          });
        } else {
          setApplication(null);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('job_application_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `job_id=eq.${jobId}&freelancer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Cambio detectado:', payload);
          fetchApplication();
        }
      )
      .subscribe();

    fetchApplication();

    return () => {
      subscription.unsubscribe();
    };
  }, [jobId, user]);

  return { application, loading };
}