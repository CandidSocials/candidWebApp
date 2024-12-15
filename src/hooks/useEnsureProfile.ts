import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

interface UseEnsureProfileResult {
  profileReady: boolean;
  error: Error | null;
}

export function useEnsureProfile(): UseEnsureProfileResult {
  const { user } = useAuth();
  const [profileReady, setProfileReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const createProfile = async () => {
      if (!user) {
        if (mounted) {
          setProfileReady(false);
          setError(null);
        }
        return;
      }

      try {
        // Verificar si ya existe el perfil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Si el perfil existe, marcarlo como listo
        if (profile && !profileError) {
          if (mounted) {
            setProfileReady(true);
            setError(null);
          }
          return;
        }

        // Si no existe el perfil o hay un error (no encontrado), crearlo
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: user.id,
            role: 'freelancer', // Rol por defecto
            full_name: user.user_metadata?.full_name || '',
            location: '',
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          throw new Error(`Error creating user profile: ${insertError.message}`);
        }

        // Verificar que el perfil se creó correctamente
        const { data: newProfile, error: verifyError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (verifyError || !newProfile) {
          throw new Error('Failed to verify profile creation');
        }

        if (mounted) {
          setProfileReady(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error managing user profile:', err);
        if (mounted) {
          setProfileReady(false);
          setError(err instanceof Error ? err : new Error('Unknown error creating profile'));
        }
      }
    };

    createProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { profileReady, error };
}
