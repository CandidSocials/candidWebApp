import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const subscription = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const presentUsers = new Set<string>();
        const state = subscription.presenceState();
        Object.values(state).forEach((presence: any) => {
          presence.forEach((p: any) => presentUsers.add(p.user_id));
        });
        setOnlineUsers(presentUsers);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { onlineUsers };
}