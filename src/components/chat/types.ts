export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    id: string;
    full_name: string;
  };
  receiver?: {
    id: string;
    full_name: string;
  };
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
  chatId: string;
  otherUserId: string;
  otherUserName: string;
}

export interface ChatModalProps {
  chatId: string;
  jobTitle: string;
  otherUserId: string;
  otherUserName: string;
}

export interface MessageInputProps {
  onSend: (content: string) => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}