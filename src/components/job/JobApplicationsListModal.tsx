import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { X, Check, XCircle, MessageSquare } from 'lucide-react';
import { JobListing, JobApplication } from '@/lib/types';

interface JobApplicationsListModalProps {
  job: JobListing;
  onClose: () => void;
}

export function JobApplicationsListModal({ job, onClose }: JobApplicationsListModalProps) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rest of the component implementation...
  const handleStartChat = async (applicationId: string) => {
    try {
      // First try to find existing chat
      const { data: existingChat, error: findError } = await supabase
        .from('chats')
        .select('id')
        .eq('job_application_id', applicationId)
        .single();

      if (findError && findError.code !== 'PGRST116') throw findError;

      if (existingChat) {
        navigate(`/chat/${existingChat.id}`);
        onClose();
        return;
      }

      // Create new chat if none exists
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([{
          job_application_id: applicationId,
          business_id: job.business_id,
          freelancer_id: applications.find(app => app.id === applicationId)?.freelancer_id
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (newChat) {
        navigate(`/chat/${newChat.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error managing chat:', error);
      setError('Failed to open chat. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal content */}
    </div>
  );
}