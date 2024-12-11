export type UserRole = 'business' | 'freelancer';

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
  status: 'open' | 'closed';
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

export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Content Writing',
  'Video Editing',
  'Photography',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];