import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { JobApplication } from '../../lib/types';
import { useAuth } from '../../lib/AuthProvider';
import { Clock, Building2, DollarSign, CheckCircle2, XCircle, Clock4 } from 'lucide-react';

export function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchApplications() {
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select(`
            *,
            job_listings(
              id,
              title,
              company_name,
              description,
              budget,
              status
            )
          `)
          .eq('freelancer_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();

    // Subscribe to changes in job applications
    const subscription = supabase
      .channel('job_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `freelancer_id=eq.${user?.id}`,
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getStatusDisplay = (application: JobApplication) => {
    const status = application.status;
    const jobStatus = application.job_listings?.status;

    if (status === 'accepted' && jobStatus === 'in_progress') {
      return {
        label: 'In Progress',
        icon: Clock4,
        className: 'bg-blue-100 text-blue-800',
      };
    }

    switch (status) {
      case 'accepted':
        return {
          label: 'Accepted',
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          className: 'bg-red-100 text-red-800',
        };
      default:
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        You haven't applied to any jobs yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const statusDisplay = getStatusDisplay(application);
        const StatusIcon = statusDisplay.icon;

        return (
          <div key={application.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">
                  {application.job_listings?.title}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Building2 className="h-4 w-4 mr-1" />
                  {application.job_listings?.company_name}
                </div>
              </div>
              <span className={`flex items-center px-3 py-1 rounded-full text-sm ${statusDisplay.className}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusDisplay.label}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-700">{application.cover_letter}</p>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                Proposed Rate: ${application.proposed_rate}/hour
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Applied on: {new Date(application.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}