import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '../types';
import { useAuth } from '@/lib/AuthProvider';

export function useMessages(jobId: string, otherUserId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId || !user || !otherUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(full_name),
            receiver:receiver_id(full_name)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
          .eq('job_id', jobId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          // Solo agregar el mensaje si es relevante para esta conversación
          if (
            (payload.new.sender_id === user.id && payload.new.receiver_id === otherUserId) ||
            (payload.new.sender_id === otherUserId && payload.new.receiver_id === user.id)
          ) {
            fetchMessages();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [jobId, user, otherUserId]);

  const sendMessage = async (content: string) => {
    if (!jobId || !content.trim() || !user || !otherUserId) return;

    try {
      const { error: sendError } = await supabase
        .from('messages')
        .insert([
          {
            job_id: jobId,
            sender_id: user.id,
            receiver_id: otherUserId,
            content: content.trim()
          }
        ]);

      if (sendError) throw sendError;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}