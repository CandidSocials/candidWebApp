import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from './index';
import { ChatMessage, ChatRoom, MessageQueryParams, ChatRoomQueryParams } from '../types/chat.types';
import { useAuth } from '@/lib/AuthProvider';

export function useChat(roomId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs for pagination
  const lastMessageRef = useRef<string | null>(null);
  const isLoadingMore = useRef(false);

  const loadMessages = useCallback(async (params: MessageQueryParams = {}) => {
    try {
      const fetchedMessages = await chatService.getMessages(roomId, params);
      setMessages(prev => {
        const newMessages = params.before 
          ? [...prev, ...fetchedMessages]
          : [...fetchedMessages, ...prev];
        return Array.from(new Set(newMessages.map(m => m.id)))
          .map(id => newMessages.find(m => m.id === id)!)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
      setHasMore(fetchedMessages.length === (params.limit || 50));
      if (fetchedMessages.length > 0) {
        lastMessageRef.current = fetchedMessages[fetchedMessages.length - 1].created_at;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'));
    }
  }, [roomId]);

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore.current || !hasMore || !lastMessageRef.current) return;
    
    isLoadingMore.current = true;
    await loadMessages({ before: lastMessageRef.current, limit: 50 });
    isLoadingMore.current = false;
  }, [loadMessages, hasMore]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newMessage = await chatService.sendMessage(roomId, user.id, content);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    }
  }, [roomId, user]);

  useEffect(() => {
    setLoading(true);
    loadMessages({ limit: 50 })
      .finally(() => setLoading(false));

    const unsubscribe = chatService.subscribeToRoom(roomId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages(prev => [...prev, payload.new]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, loadMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMoreMessages,
    sendMessage
  };
}

export function useChatRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRooms = useCallback(async (params: ChatRoomQueryParams = {}) => {
    if (!user) return;

    try {
      const fetchedRooms = await chatService.getRooms(user.id, params);
      setRooms(fetchedRooms);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chat rooms'));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    loadRooms()
      .finally(() => setLoading(false));

    const unsubscribe = chatService.subscribeToRooms(user.id, () => {
      loadRooms();
    });

    return () => {
      unsubscribe();
    };
  }, [user, loadRooms]);

  const createRoom = useCallback(async (jobApplicationId: string, businessId: string, freelancerId: string) => {
    try {
      const newRoom = await chatService.createRoom(jobApplicationId, businessId, freelancerId);
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create chat room'));
      throw err;
    }
  }, []);

  return {
    rooms,
    loading,
    error,
    createRoom,
    refreshRooms: loadRooms
  };
}