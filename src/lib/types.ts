export type UserRole = 'business' | 'freelancer';

export const CATEGORIES = [
  'Video Editing',
  'Photography',
  'Videography',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  company_name?: string;
  full_name: string;
  bio?: string;
  skills?: string[];
  location: string;
  created_at: string;
}

export interface JobListing {
  id: string;
  business_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  skills_required: string[];
  created_at: string;
  company_name?: string;
  status: 'open' | 'closed' | 'in_progress';
}

export interface JobApplication {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter: string;
  proposed_rate: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  freelancer?: {
    full_name: string;
  };
  job_listings?: JobListing;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: {
    profile: {
      full_name: string;
    };
  };
}

export interface ChatInfo {
  business_id: string;
  freelancer_id: string;
  job_application: {
    job: {
      title: string;
    };
  };
}

export interface TalentListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  hourly_rate: number;
  location: string;
  skills: string[];
  user_email: string;
  created_at: string;
}