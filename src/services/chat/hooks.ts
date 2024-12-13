import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthProvider';
import { ChatMessage, Chat } from './types';
import * as chatApi from './api';

export function useChat(chatId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await chatApi.fetchMessages(chatId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;
    try {
      await chatApi.sendMessage(chatId, user.id, content);
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

  return { messages, loading, error, sendMessage };
}

export function useChatRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    try {
      const data = await chatApi.fetchChats(user.id);
      setRooms(data);
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