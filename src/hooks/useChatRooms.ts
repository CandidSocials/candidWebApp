import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ChatParticipant {
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  job_application_id: string;
  job_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
}

export function useChatRooms(userId: string) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_rooms_with_participants')
          .select('*')
          .contains('participants', `[{"user_id": "${userId}"}]`)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setRooms(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(err as Error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('chat_room_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms_with_participants'
        },
        (payload) => {
          console.log('Cambio detectado en chat rooms:', payload);
          fetchRooms();
        }
      )
      .subscribe();

    fetchRooms();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { rooms, loading, error };
}
