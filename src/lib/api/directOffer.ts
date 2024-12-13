import { supabase } from '../supabase';

interface CreateJobListingParams {
  businessId: string;
  description: string;
  hourlyRate: number;
}

export async function createJobListing({ businessId, description, hourlyRate }: CreateJobListingParams) {
  const { data, error } = await supabase
    .from('job_listings')
    .insert([{
      business_id: businessId,
      title: 'Direct Offer',
      description,
      category: 'Direct Offer',
      budget: hourlyRate,
      location: 'Remote',
      skills_required: [],
      status: 'open'
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create job listing');
  
  return data;
}

interface CreateApplicationParams {
  jobId: string;
  freelancerId: string;
  hourlyRate: number;
}

export async function createApplication({ jobId, freelancerId, hourlyRate }: CreateApplicationParams) {
  const { data, error } = await supabase
    .from('job_applications')
    .insert([{
      job_id: jobId,
      freelancer_id: freelancerId,
      cover_letter: 'Direct offer from business',
      proposed_rate: hourlyRate,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create application');

  return data;
}

interface CreateChatParams {
  jobApplicationId: string;
  businessId: string;
  freelancerId: string;
}

export async function createChat({ jobApplicationId, businessId, freelancerId }: CreateChatParams) {
  const { error } = await supabase
    .from('chats')
    .insert([{
      job_application_id: jobApplicationId,
      business_id: businessId,
      freelancer_id: freelancerId
    }]);

  if (error) throw error;
}

interface CreateNotificationParams {
  userId: string;
  jobId: string;
  applicationId: string;
  hourlyRate: number;
}

export async function createNotification({ userId, jobId, applicationId, hourlyRate }: CreateNotificationParams) {
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type: 'direct_offer',
      title: 'New Direct Offer',
      message: `You have received a direct offer with a rate of $${hourlyRate}/hour`,
      data: {
        jobId,
        applicationId,
        hourlyRate
      }
    }]);

  if (error) throw error;
}