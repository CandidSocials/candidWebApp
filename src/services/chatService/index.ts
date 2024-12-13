import { supabase } from '@/lib/supabase';
import { 
  ChatMessage, 
  ChatRoom, 
  ChatServiceConfig, 
  ChatRoomQueryParams,
  MessageQueryParams,
  ChatError 
} from '../types/chat.types';
import { chatCache } from './cache';

class ChatService {
  private config: ChatServiceConfig;
  private messageSubscriptions: Map<string, () => void>;
  private roomSubscriptions: Map<string, () => void>;

  constructor(config: ChatServiceConfig = {}) {
    this.config = {
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      ...config
    };
    this.messageSubscriptions = new Map();
    this.roomSubscriptions = new Map();
  }

  // Room Methods
  async createRoom(jobApplicationId: string, businessId: string, freelancerId: string): Promise<ChatRoom> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert([
          {
            job_application_id: jobApplicationId,
            business_id: businessId,
            freelancer_id: freelancerId
          }
        ])
        .select('*')
        .single();

      if (error) throw this.handleError(error);

      // Clear user cache for both participants
      if (this.config.enableCache) {
        chatCache.clearUserCache(businessId);
        chatCache.clearUserCache(freelancerId);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRooms(userId: string, params: ChatRoomQueryParams = {}): Promise<ChatRoom[]> {
    try {
      // Check cache first
      if (this.config.enableCache) {
        const cachedRooms = chatCache.getRooms(userId);
        if (cachedRooms) {
          return cachedRooms;
        }
      }

      const query = supabase
        .from('chat_rooms')
        .select(`
          *,
          participants:chat_participants(
            user_id,
            profile:user_profiles(full_name, profile_image)
          ),
          last_message:chat_messages(
            id,
            content,
            created_at,
            sender:user_profiles(full_name)
          )
        `)
        .or(`business_id.eq.${userId},freelancer_id.eq.${userId}`)
        .order(params.orderBy || 'updated_at', { ascending: params.orderDirection === 'asc' })
        .limit(params.limit || 50)
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

      const { data, error } = await query;

      if (error) throw this.handleError(error);

      // Update cache
      if (this.config.enableCache && data) {
        chatCache.setRooms(userId, data);
      }

      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Message Methods
  async sendMessage(roomId: string, senderId: string, content: string): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            sender_id: senderId,
            content: content.trim(),
            type: 'text',
            status: 'sent'
          }
        ])
        .select('*, sender:user_profiles(full_name, profile_image)')
        .single();

      if (error) throw this.handleError(error);
      
      // Update room's updated_at
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      // Update cache
      if (this.config.enableCache && data) {
        chatCache.updateRoomMessages(roomId, data);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMessages(roomId: string, params: MessageQueryParams = {}): Promise<ChatMessage[]> {
    try {
      // Check cache first if not requesting specific page
      if (this.config.enableCache && !params.before && !params.after) {
        const cachedMessages = chatCache.getMessages(roomId);
        if (cachedMessages) {
          return cachedMessages;
        }
      }

      let query = supabase
        .from('chat_messages')
        .select('*, sender:user_profiles(full_name, profile_image)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(params.limit || 50);

      if (params.before) {
        query = query.lt('created_at', params.before);
      }
      if (params.after) {
        query = query.gt('created_at', params.after);
      }

      const { data, error } = await query;

      if (error) throw this.handleError(error);

      // Update cache only for initial load
      if (this.config.enableCache && data && !params.before && !params.after) {
        chatCache.setMessages(roomId, data);
      }

      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Subscription Methods with Cache Integration
  subscribeToRoom(roomId: string, callback: (payload: any) => void): () => void {
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && this.config.enableCache) {
            chatCache.updateRoomMessages(roomId, payload.new);
          }
          callback(payload);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.messageSubscriptions.delete(roomId);
    };

    this.messageSubscriptions.set(roomId, unsubscribe);
    return unsubscribe;
  }

  subscribeToRooms(userId: string, callback: (payload: any) => void): () => void {
    const subscription = supabase
      .channel('room_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `business_id=eq.${userId},freelancer_id=eq.${userId}`,
        },
        (payload) => {
          if (this.config.enableCache) {
            chatCache.clearUserCache(userId);
          }
          callback(payload);
        }
      )
      .subscribe();

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.roomSubscriptions.delete(userId);
    };

    this.roomSubscriptions.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Error Handling
  private handleError(error: any): ChatError {
    const chatError = new Error(error.message || 'Chat service error') as ChatError;
    chatError.code = error.code;
    chatError.details = error.details;
    return chatError;
  }

  // Cleanup
  cleanup() {
    this.messageSubscriptions.forEach(unsubscribe => unsubscribe());
    this.roomSubscriptions.forEach(unsubscribe => unsubscribe());
    this.messageSubscriptions.clear();
    this.roomSubscriptions.clear();
    if (this.config.enableCache) {
      chatCache.clearCache();
    }
  }
}

export const chatService = new ChatService();