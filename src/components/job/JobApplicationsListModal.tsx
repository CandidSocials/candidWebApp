import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { JobApplication, JobListing } from '../../lib/types';
import { X, Check, XCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JobMessages } from './JobMessages';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';

interface JobApplicationsListModalProps {
  job: JobListing;
  onClose: () => void;
}

export function JobApplicationsListModal({ job, onClose }: JobApplicationsListModalProps) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

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
      setError('');
      
      // Update application status
      const { error: applicationError } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (applicationError) throw applicationError;

      // Update local state immediately
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // If accepted, handle additional updates
      if (newStatus === 'accepted') {
        const application = applications.find(app => app.id === applicationId);
        
        if (application) {
          // Update job status
          await supabase
            .from('job_listings')
            .update({ status: 'in_progress' })
            .eq('id', job.id);

          // Create chat room
          const { data: chatRoom } = await supabase
            .from('chat_rooms')
            .insert([
              {
                name: `Job: ${job.title}`,
                job_id: job.id
              }
            ])
            .select()
            .single();

          if (chatRoom) {
            // Add participants
            await supabase
              .from('chat_participants')
              .insert([
                {
                  room_id: chatRoom.id,
                  user_id: job.business_id
                },
                {
                  room_id: chatRoom.id,
                  user_id: application.freelancer_id
                }
              ]);
          }

          // Create notification
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
                  applicationId: applicationId
                }
              }
            ]);
        }
      }

    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
      
      // Refresh applications list to ensure UI is in sync with DB
      await fetchApplications();
    }
  };

  const handleStartChat = async (applicationId: string) => {
    try {
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('job_id', job.id)
        .single();

      if (chatRoom) {
        navigate(`/chats/${chatRoom.id}`);
      }
    } catch (error) {
      console.error('Error finding chat room:', error);
    }
  };

  const handleAccept = async (applicationId: string) => {
    await handleStatusUpdate(applicationId, 'accepted');
  };

  const handleReject = async (applicationId: string) => {
    await handleStatusUpdate(applicationId, 'rejected');
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 text-sm rounded-full';
      case 'accepted':
        return 'bg-green-100 text-green-800 px-2 py-1 text-sm rounded-full';
      case 'rejected':
        return 'bg-red-100 text-red-800 px-2 py-1 text-sm rounded-full';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Aplicaciones para: {job.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay aplicaciones todavía
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {application.freelancer?.full_name}
                      </h3>
                      <p className="text-gray-600 mt-1">{application.proposal}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={getStatusClass(application.status)}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedChat({
                          userId: application.freelancer_id,
                          userName: application.freelancer?.full_name || 'Usuario'
                        })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Enviar mensaje"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(application.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            title="Aceptar aplicación"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(application.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Rechazar aplicación"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de chat */}
      <Dialog 
        open={!!selectedChat} 
        onClose={() => setSelectedChat(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>Chat con {selectedChat?.userName}</span>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setSelectedChat(null)}
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedChat && (
            <JobMessages
              jobId={job.id}
              otherUserId={selectedChat.userId}
              otherUserName={selectedChat.userName}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}