export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      full_name: string;
      avatar_url?: string;
    };
  }[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

export interface ChatProps {
  jobId?: string;
  otherUserId: string;
  otherUserName: string;
}

export interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  otherUserName: string;
}

export interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
}