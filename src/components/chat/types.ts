export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  sender?: {
    full_name: string;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  updated_at: string;
  participants: Array<{
    user_id: string;
    profile: {
      full_name: string;
    };
  }>;
}

export interface ChatParticipant {
  user_id: string;
  profile: {
    full_name: string;
  };
}