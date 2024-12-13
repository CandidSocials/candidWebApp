import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatRoom } from '../types';

export function useChatRoom(chatId: string) {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const { data, error: fetchError } = await supabase
          .from('chat_rooms')
          .select(`
            id,
            name,
            type,
            updated_at,
            participants:chat_participants(
              user_id,
              profile:user_profiles(full_name)
            )
          `)
          .eq('id', chatId)
          .single();

        if (fetchError) throw fetchError;
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chat room');
      } finally {
        setLoading(false);
      }
    }

    if (chatId) {
      fetchRoom();
    }
  }, [chatId]);

  return { room, loading, error };
}