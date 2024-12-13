import { supabase } from '@/lib/supabase';

export const ChatService = {
  async sendMessage(roomId: string, userId: string, content: string) {
    if (!roomId || !userId || !content.trim()) throw new Error('Invalid parameters.');

    const { error } = await supabase.from('chat_messages').insert([
      { room_id: roomId, sender_id: userId, content: content.trim(), type: 'text' },
    ]);
    if (error) throw error;
  },

  async fetchMessages(roomId: string) {
    if (!roomId) throw new Error('Room ID is required.');

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async subscribeToMessages(roomId: string, callback: (payload: any) => void) {
    if (!roomId) throw new Error('Room ID is required.');

    return supabase
      .from(`chat_messages:room_id=eq.${roomId}`)
      .on('INSERT', payload => callback(payload.new))
      .subscribe();
  },
};