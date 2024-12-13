import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X } from 'lucide-react';

interface ApplicationActionsProps {
  jobId: string;
  applicationId: string;
  currentStatus: string;
  onStatusChange: () => void;
}

export function ApplicationActions({
  jobId,
  applicationId,
  currentStatus,
  onStatusChange
}: ApplicationActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
    setIsProcessing(true);
    try {
      // Update application status
      const { error: applicationError } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (applicationError) throw applicationError;

      // If accepting, update job status to in_progress
      if (newStatus === 'accepted') {
        const { error: jobError } = await supabase
          .from('job_listings')
          .update({ status: 'in_progress' })
          .eq('id', jobId);

        if (jobError) throw jobError;
      }

      onStatusChange();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentStatus !== 'pending') {
    return null;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleStatusUpdate('accepted')}
        disabled={isProcessing}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        <Check className="h-4 w-4 mr-1" />
        Accept
      </button>
      <button
        onClick={() => handleStatusUpdate('rejected')}
        disabled={isProcessing}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
      >
        <X className="h-4 w-4 mr-1" />
        Reject
      </button>
    </div>
  );
}