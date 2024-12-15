import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '../types';
import { useAuth } from '@/lib/AuthProvider';

export function useMessages(otherUserId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  console.log('[useMessages] Initialized with otherUserId:', otherUserId);
  console.log('[useMessages] Current user:', user);

  useEffect(() => {
    if (!otherUserId || !user) {
      console.log('[useMessages] Missing otherUserId or user, skipping fetch');
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      console.log('[useMessages] Starting to fetch messages...');
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            created_at,
            read,
            sender:profiles!messages_sender_id_fkey(
              id,
              full_name
            ),
            receiver:profiles!messages_receiver_id_fkey(
              id,
              full_name
            )
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('[useMessages] Error fetching messages:', fetchError);
          throw fetchError;
        }

        console.log('[useMessages] Messages fetched successfully:', {
          messageCount: data?.length,
          firstMessage: data?.[0],
          lastMessage: data?.[data.length - 1]
        });
        
        setMessages(data || []);
        setError(null);

        // Mark received messages as read
        if (data && data.length > 0) {
          const unreadMessages = data.filter(msg => 
            msg.receiver_id === user.id && !msg.read
          );

          if (unreadMessages.length > 0) {
            const { error: updateError } = await supabase
              .from('messages')
              .update({ read: true })
              .in('id', unreadMessages.map(msg => msg.id));

            if (updateError) {
              console.error('[useMessages] Error marking messages as read:', updateError);
            }
          }
        }
      } catch (err) {
        console.error('[useMessages] Error in fetchMessages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchMessages();

    // Subscribe to new messages
    console.log('[useMessages] Setting up realtime subscription');
    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id}))`
        },
        async (payload) => {
          console.log('[useMessages] Received new message:', payload);
          await fetchMessages();
        }
      )
      .subscribe((status) => {
        console.log('[useMessages] Subscription status:', status);
      });

    return () => {
      console.log('[useMessages] Cleaning up subscription');
      channel.unsubscribe();
    };
  }, [otherUserId, user]);

  const sendMessage = async (content: string) => {
    if (!otherUserId || !user || !content.trim()) {
      console.error('[useMessages] Missing required data for sending message:', { otherUserId, userId: user?.id, content });
      return;
    }

    try {
      console.log('[useMessages] Sending message:', {
        senderId: user.id,
        receiverId: otherUserId,
        content
      });

      const { error: sendError } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: otherUserId,
            content: content.trim(),
            read: false
          },
        ]);

      if (sendError) {
        console.error('[useMessages] Error sending message:', sendError);
        throw sendError;
      }

      console.log('[useMessages] Message sent successfully');
    } catch (err) {
      console.error('[useMessages] Error in sendMessage:', err);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}