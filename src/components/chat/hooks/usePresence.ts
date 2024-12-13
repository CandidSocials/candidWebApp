import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PresenceUser {
  user_id: string;
  profile?: {
    full_name: string;
  };
}

interface OnlineUsers {
  [key: string]: PresenceUser;
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsers>({});

  useEffect(() => {
    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users: OnlineUsers = {};
        
        Object.entries(state).forEach(([key, presence]) => {
          if (presence && presence.length > 0) {
            const user = presence[0];
            users[user.user_id] = user;
          }
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: supabase.auth.getUser().then(({ data }) => data.user?.id),
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { onlineUsers };
}