import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchOnlineUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('user_id', user.id);

        if (error) throw error;
        setOnlineUsers(data || []);
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    // Fetch initial users
    fetchOnlineUsers();

    // Subscribe to presence changes
    const presenceChannel = supabase.channel('online_users');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        fetchOnlineUsers();
      })
      .on('presence', { event: 'join' }, () => {
        fetchOnlineUsers();
      })
      .on('presence', { event: 'leave' }, () => {
        fetchOnlineUsers();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  return { onlineUsers };
}