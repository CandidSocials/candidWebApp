import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthProvider';
import { ChatMessage, ChatRoom } from '../types/chat.types';

export function useChat(chatId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages_with_profiles')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: user.id,
            content: content.trim()
          }
        ]);

      if (error) throw error;
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    }
  };

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage
  };
}

export function useChatRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          business:business_id(
            user_profiles(full_name)
          ),
          freelancer:freelancer_id(
            user_profiles(full_name)
          ),
          job_application:job_application_id(
            job:job_listings(title)
          )
        `)
        .or(`business_id.eq.${user.id},freelancer_id.eq.${user.id}`);

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch chat rooms'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();

    const subscription = supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRooms]);

  return { rooms, loading, error };
}