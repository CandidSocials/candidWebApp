import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export const ensureUserProfile = async (user: User) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('Creating user profile for:', user.id);
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        }]);

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }
      
      // Fetch and return the newly created profile
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      return newProfile;
    }

    return profile;
  } catch (error) {
    console.error('Error managing user profile:', error);
    return null;
  }
};
