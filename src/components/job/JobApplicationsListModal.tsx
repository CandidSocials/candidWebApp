import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { JobApplication, JobListing } from '../../lib/types';
import { X, Check, XCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobApplicationsListModalProps {
  job: JobListing;
  onClose: () => void;
}

export function JobApplicationsListModal({ job, onClose }: JobApplicationsListModalProps) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [job.id]);

  const fetchApplications = async () => {
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', job.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      const applications = await Promise.all(
        (applicationsData || []).map(async (application) => {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', application.freelancer_id)
            .single();

          return {
            ...application,
            freelancer: {
              full_name: profileData?.full_name || 'Unknown User'
            }
          };
        })
      );

      setApplications(applications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      // If accepted, create a chat
      if (newStatus === 'accepted') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: chatError } = await supabase
            .from('chats')
            .insert([
              {
                job_application_id: applicationId,
                business_id: job.business_id,
                freelancer_id: application.freelancer_id
              }
            ]);

          if (chatError) throw chatError;
        }
      }

      // Create notification for the freelancer
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: application.freelancer_id,
              type: 'application_status',
              title: `Application ${newStatus}`,
              message: `Your application for "${job.title}" has been ${newStatus}`,
              data: {
                jobId: job.id,
                applicationId: applicationId,
              },
            },
          ]);
      }

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application status');
    }
  };

  const handleStartChat = async (applicationId: string) => {
    try {
      const { data: chat } = await supabase
        .from('chats')
        .select('id')
        .eq('job_application_id', applicationId)
        .single();

      if (chat) {
        navigate(`/chat/${chat.id}`);
      }
    } catch (error) {
      console.error('Error finding chat:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Applications for {job.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No applications received yet.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {application.freelancer?.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Applied on: {new Date(application.created_at).toLocaleDateString()}
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
                <div className="mt-4 flex space-x-2">
                  {application.status === 'pending' ? (
                    <>
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
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </>
                  ) : application.status === 'accepted' && (
                    <button
                      onClick={() => handleStartChat(application.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}