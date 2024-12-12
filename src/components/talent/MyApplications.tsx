import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { JobApplication } from '../../lib/types';
import { useAuth } from '../../lib/AuthProvider';

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
            job_listings(*)
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
  }, [user]);

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
      {applications.map((application) => (
        <div key={application.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">
                {application.job_listings?.title}
              </h3>
              <p className="text-sm text-gray-500">
                {application.job_listings?.company_name}
              </p>
            </div>
            <span className={`px-2 py-1 text-sm rounded-full ${
              application.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : application.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-gray-700">{application.cover_letter}</p>
            <p className="mt-2 text-sm text-gray-600">
              Proposed Rate: ${application.proposed_rate}/hour
            </p>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Applied on: {new Date(application.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}