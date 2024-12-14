import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

export type Message = {
  id: string;
  job_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_profile?: {
    full_name: string;
  };
  receiver_profile?: {
    full_name: string;
  };
};

export function useMessages(jobId: string, receiverId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !jobId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:user_profiles!messages_sender_id_fkey(
              full_name
            ),
            receiver_profile:user_profiles!messages_receiver_id_fkey(
              full_name
            )
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
          .eq('job_id', jobId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === receiverId) ||
            (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id)
          ) {
            // Fetch the complete message with profiles
            const { data, error } = await supabase
              .from('messages')
              .select(`
                *,
                sender_profile:user_profiles!messages_sender_id_fkey(
                  full_name
                ),
                receiver_profile:user_profiles!messages_receiver_id_fkey(
                  full_name
                )
              `)
              .eq('id', newMessage.id)
              .single();

            if (!error && data) {
              setMessages((prevMessages) => [...prevMessages, data]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, jobId, receiverId]);

  const sendMessage = async (content: string) => {
    if (!user || !jobId || !receiverId) return;

    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        console.error('User profile not found');
        return;
      }

      const { data: receiverProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', receiverId)
        .single();

      if (!receiverProfile) {
        console.error('Receiver profile not found');
        return;
      }

      const { error } = await supabase.from('messages').insert({
        job_id: jobId,
        sender_id: userProfile.id,
        receiver_id: receiverProfile.id,
        content,
      });

      if (error) {
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
}
