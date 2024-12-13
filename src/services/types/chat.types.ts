// Enums and Basic Types
export type UserRole = 'business' | 'freelancer';
export type MessageType = 'text' | 'image' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ChatRoomType = 'direct' | 'group';
export type ChatRoomStatus = 'active' | 'archived' | 'closed';

// Base Interfaces
export interface BaseUser {
  id: string;
  email: string;
  full_name: string;
  profile_image?: string;
}

// Chat Message Interfaces
export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  attachments?: string[];
  metadata?: Record<string, any>;
  sender?: {
    full_name: string;
    profile_image?: string;
  };
}

// Chat Room Interfaces
export interface ChatRoom {
  id: string;
  name?: string;
  type: ChatRoomType;
  status: ChatRoomStatus;
  job_application_id: string;
  business_id: string;
  freelancer_id: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
  participants: ChatParticipant[];
  metadata?: {
    job_title?: string;
    job_status?: 'open' | 'in_progress' | 'completed';
    last_activity?: string;
  };
}

export interface ChatParticipant {
  user_id: string;
  room_id: string;
  joined_at: string;
  last_seen?: string;
  is_online?: boolean;
  role?: 'admin' | 'member';
  profile: {
    full_name: string;
    profile_image?: string;
  };
}

// Service Configuration Interfaces
export interface ChatServiceConfig {
  enableCache: boolean;
  cacheTimeout: number;
  maxRetries: number;
  heartbeatInterval: number;
  messageBatchSize: number;
}

export interface ChatError extends Error {
  code?: string;
  details?: string;
  context?: Record<string, any>;
}

// Query Parameters Interfaces
export interface ChatRoomQueryParams {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at';
  orderDirection?: 'asc' | 'desc';
  status?: ChatRoomStatus;
  type?: ChatRoomType;
  search?: string;
}

export interface MessageQueryParams {
  limit?: number;
  before?: string;
  after?: string;
  type?: MessageType;
  status?: MessageStatus;
}

// Component Props Interfaces
export interface ChatModalProps {
  chatId: string;
  jobTitle: string;
  otherUserName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export interface ChatRoomProps {
  chatId: string;
  className?: string;
  onClose?: () => void;
}

export interface ChatWindowProps {
  className?: string;
  minimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export interface MessageListProps {
  messages: ChatMessage[];
  userId: string;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

export interface MessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  otherUserName?: string;
  showTimestamp?: boolean;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
}

export interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showAttachmentButton?: boolean;
  onAttachmentSelect?: (file: File) => void;
}

export interface OnlineUsersProps {
  users: ChatParticipant[];
  isLoading?: boolean;
  onUserClick?: (userId: string) => void;
}

// Cache Related Interfaces
export interface ChatCacheConfig {
  maxSize: number;
  expirationTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Events and Subscriptions
export interface ChatEvent {
  type: 'message' | 'status' | 'typing' | 'presence';
  payload: any;
  timestamp: string;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  timestamp: number;
}

// Presence and Status
export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  device?: string;
}