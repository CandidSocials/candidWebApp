import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '../types';
import { useAuth } from '@/lib/AuthProvider';

export function useMessages(roomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        const { data, error: fetchError } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:user_profiles!inner(full_name)
          `)
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the sender's profile for the new message
          const { data: senderData } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            sender: senderData
          } as Message;

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, user]);

  const sendMessage = async (content: string) => {
    if (!roomId || !content.trim() || !user) return;

    try {
      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            sender_id: user.id,
            content: content.trim(),
            type: 'text'
          }
        ]);

      if (sendError) throw sendError;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return { messages, loading, error, sendMessage };
}