export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  read: boolean;
  sender_name?: string;
  sender_role?: string;
}

export interface Chat {
  id: string;
  job_application_id: string;
  business_id: string;
  freelancer_id: string;
  created_at: string;
  updated_at: string;
  business?: {
    user_profiles: {
      full_name: string;
    }[];
  };
  freelancer?: {
    user_profiles: {
      full_name: string;
    }[];
  };
  job_application?: {
    job: {
      title: string;
    };
  };
}

export interface ChatParticipant {
  user_id: string;
  last_seen?: string;
  profile: {
    full_name: string;
  };
}