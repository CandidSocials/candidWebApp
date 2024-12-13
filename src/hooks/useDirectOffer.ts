import { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import {
  createJobListing,
  createApplication,
  createChat,
  createNotification
} from '../lib/api/directOffer';

interface DirectOfferParams {
  freelancerId: string;
  description: string;
  hourlyRate: number;
}

export function useDirectOffer() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendDirectOffer = async ({ freelancerId, description, hourlyRate }: DirectOfferParams) => {
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('You must be logged in to send an offer');
      }

      // Create job listing
      const jobData = await createJobListing({
        businessId: user.id,
        description,
        hourlyRate
      });

      // Create application
      const applicationData = await createApplication({
        jobId: jobData.id,
        freelancerId,
        hourlyRate
      });

      // Create chat
      await createChat({
        jobApplicationId: applicationData.id,
        businessId: user.id,
        freelancerId
      });

      // Create notification
      await createNotification({
        userId: freelancerId,
        jobId: jobData.id,
        applicationId: applicationData.id,
        hourlyRate
      });

      return true;
    } catch (err) {
      console.error('Error sending offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to send offer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendDirectOffer,
    loading,
    error
  };
}