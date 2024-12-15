import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  job_id?: string;
  content: string;
  created_at: string;
  read_at?: string;
  read?: boolean;
  sender_profile?: {
    id: string;
    full_name: string;
  };
  receiver_profile?: {
    id: string;
    full_name: string;
  };
};

export function useMessages(receiverId: string, jobId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !receiverId) return;

    const fetchMessages = async () => {
      try {
        // Primero obtenemos los IDs de los perfiles
        const { data: senderProfile, error: senderError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (senderError) {
          throw new Error('Could not find sender profile');
        }

        const { data: receiverProfile, error: receiverError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', receiverId)
          .single();

        if (receiverError) {
          throw new Error('Could not find receiver profile');
        }

        // Luego usamos esos IDs para buscar los mensajes
        const query = supabase
          .from('messages')
          .select(`
            *,
            sender_profile:sender_id(
              id,
              full_name
            ),
            receiver_profile:receiver_id(
              id,
              full_name
            )
          `)
          .or(`and(sender_id.eq.${senderProfile.id},receiver_id.eq.${receiverProfile.id}),and(sender_id.eq.${receiverProfile.id},receiver_id.eq.${senderProfile.id})`);

        if (jobId) {
          query.eq('job_id', jobId);
        }

        const { data, error } = await query.order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('[useMessages] Error fetching messages:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
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
          filter: jobId ? `job_id=eq.${jobId}` : undefined,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Obtener los IDs de los perfiles para comparar
          const { data: senderProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

          const { data: receiverProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', receiverId)
            .single();

          if (senderProfile && receiverProfile) {
            if (
              (newMessage.sender_id === senderProfile.id && newMessage.receiver_id === receiverProfile.id) ||
              (newMessage.sender_id === receiverProfile.id && newMessage.receiver_id === senderProfile.id)
            ) {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  sender_profile:sender_id(
                    id,
                    full_name
                  ),
                  receiver_profile:receiver_id(
                    id,
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
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, jobId, receiverId]);

  const sendMessage = async (content: string) => {
    if (!user || !receiverId) return;

    try {
      // Obtener los IDs de los perfiles
      const { data: senderProfile, error: senderError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (senderError) {
        throw new Error('Could not find sender profile');
      }

      const { data: receiverProfile, error: receiverError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', receiverId)
        .single();

      if (receiverError) {
        throw new Error('Could not find receiver profile');
      }

      const { error } = await supabase.from('messages').insert({
        job_id: jobId || null,
        sender_id: senderProfile.id,
        receiver_id: receiverProfile.id,
        content,
        read_at: null
      });

      if (error) {
        console.error('[useMessages] Error sending message:', error);
        throw error;
      }
    } catch (error) {
      console.error('[useMessages] Error in sendMessage:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage
  };
}
