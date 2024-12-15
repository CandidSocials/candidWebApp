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
        console.log('[useChatRooms] Fetching chat rooms for user:', user.id);
        
        const { data, error } = await supabase
          .from('chat_rooms')
          .select(`
            id,
            name,
            created_at,
            updated_at,
            participants:chat_room_participants(
              user_id,
              profile:profiles(
                full_name,
                avatar_url
              )
            ),
            last_message:messages(
              content,
              created_at
            )
          `)
          .eq('chat_room_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('[useChatRooms] Error fetching rooms:', error);
          setError(error.message);
          return;
        }

        console.log('[useChatRooms] Fetched rooms:', data);
        setRooms(data || []);
        setError(null);
      } catch (error) {
        console.error('[useChatRooms] Error fetching rooms:', error);
        setError('Failed to fetch chat rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Subscribe to chat room updates
    const roomsSubscription = supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `chat_room_participants.user_id=eq.${user.id}`
        },
        () => fetchRooms()
      )
      .subscribe();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => fetchRooms()
      )
      .subscribe();

    return () => {
      roomsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [user]);

  return { rooms, loading, error };
}