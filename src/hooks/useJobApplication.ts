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

    async function fetchApplication() {
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*, job_listings(status)')
          .eq('job_id', jobId)
          .eq('freelancer_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setApplication(data);
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();

    // Subscribe to changes
    const subscription = supabase
      .channel('job_application_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `job_id=eq.${jobId},freelancer_id=eq.${user.id}`,
        },
        () => {
          fetchApplication();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [jobId, user]);

  return { application, loading };
}