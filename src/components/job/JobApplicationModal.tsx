import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthProvider';
import { JobListing } from '../../lib/types';
import { X } from 'lucide-react';

interface JobApplicationModalProps {
  job: JobListing;
  onClose: () => void;
  onSuccess: () => void;
}

export function JobApplicationModal({ job, onClose, onSuccess }: JobApplicationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      if (!user) {
        throw new Error('You must be logged in to apply');
      }

      // First, create the job application
      const { data: applicationData, error: applicationError } = await supabase
        .from('job_applications')
        .insert([
          {
            job_id: job.id,
            freelancer_id: user.id,
            cover_letter: formData.get('coverLetter'),
            proposed_rate: parseFloat(formData.get('proposedRate')?.toString() || '0'),
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (applicationError) {
        throw applicationError;
      }

      if (!applicationData) {
        throw new Error('Failed to create application');
      }

      // Then, create the notification for the business owner
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: job.business_id,
            type: 'job_application',
            title: 'New Job Application',
            message: `Someone applied to your job posting: ${job.title}`,
            data: {
              jobId: job.id,
              applicationId: applicationData.id,
            },
          },
        ]);

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't throw here as the application was successful
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Application error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Apply to {job.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
              Cover Letter
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Tell us why you're perfect for this job..."
            />
          </div>

          <div>
            <label htmlFor="proposedRate" className="block text-sm font-medium text-gray-700">
              Proposed Rate ($ per hour)
            </label>
            <input
              type="number"
              id="proposedRate"
              name="proposedRate"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}