import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatRoom } from '../types';
import { useAuth } from '@/lib/AuthProvider';

export function useChatRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      try {
        // Obtener mensajes agrupados por job_id
        const { data, error } = await supabase
          .from('messages')
          .select(`
            job_id,
            job:job_listings(title),
            sender:sender_id(full_name),
            receiver:receiver_id(full_name),
            created_at,
            content
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching rooms:', error);
          setError(error.message);
          return;
        }

        // Agrupar mensajes por job_id
        const roomsMap = new Map();
        data?.forEach(message => {
          if (!roomsMap.has(message.job_id)) {
            const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
            roomsMap.set(message.job_id, {
              id: message.job_id,
              name: message.job.title,
              updated_at: message.created_at,
              participants: [
                {
                  user_id: message.sender_id,
                  profile: message.sender
                },
                {
                  user_id: message.receiver_id,
                  profile: message.receiver
                }
              ],
              last_message: {
                content: message.content,
                created_at: message.created_at
              }
            });
          }
        });

        setRooms(Array.from(roomsMap.values()));
        setError(null);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to fetch chat rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        () => fetchRooms()
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user]);

  return { rooms, loading, error };
}