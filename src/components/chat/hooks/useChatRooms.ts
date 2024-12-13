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

    async function fetchRooms() {
      try {
        const { data, error: roomsError } = await supabase
          .from('chat_rooms_with_participants')
          .select('*')
          .order('updated_at', { ascending: false });

        if (roomsError) throw roomsError;

        // Filter rooms where the user is a participant
        const userRooms = (data || []).filter(room => 
          room.participants?.some(p => p.user_id === user.id)
        );
        
        setRooms(userRooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chat rooms');
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();

    // Subscribe to changes
    const subscription = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        () => fetchRooms()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => fetchRooms()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { rooms, loading, error };
}