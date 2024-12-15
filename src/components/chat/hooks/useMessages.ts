import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender_profile?: {
    full_name: string;
  };
}

export function useMessages(receiverId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !receiverId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:user_profiles!sender_id(full_name)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}))`
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            sender_profile: profile
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiverId]);

  const sendMessage = async (content: string) => {
    if (!user || !receiverId || !content.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: content.trim(),
            sender_id: user.id,
            receiver_id: receiverId
          }
        ]);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage
  };
}