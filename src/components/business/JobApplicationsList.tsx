import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { JobApplication } from '../../lib/types';
import { useAuth } from '../../lib/AuthProvider';
import { Check, X } from 'lucide-react';

export function JobApplicationsList() {
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
            job_listings_with_profiles!inner(*),
            user_profiles!inner(full_name)
          `)
          .eq('job_listings_with_profiles.business_id', user?.id)
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

  const handleStatusUpdate = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application status');
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
        No applications received yet.
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
                {application.user_profiles?.full_name}
              </h3>
              <p className="text-sm text-gray-500">
                Applied for: {application.job_listings_with_profiles?.title}
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
          {application.status === 'pending' && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleStatusUpdate(application.id, 'accepted')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </button>
              <button
                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}