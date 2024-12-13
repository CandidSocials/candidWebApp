import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthProvider';
import { useProfile } from '@/lib/useProfile';

interface PresenceUser {
  user_id: string;
  profile: {
    full_name: string;
  };
}

interface OnlineUsers {
  [key: string]: PresenceUser;
}

export function usePresence() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsers>({});

  useEffect(() => {
    if (!user || !profile) return;

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
            user_id: user.id,
            profile: {
              full_name: profile.full_name
            },
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, profile]);

  return { onlineUsers };
}