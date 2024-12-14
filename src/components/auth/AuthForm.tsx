import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../lib/types';

type AuthMode = 'signin' | 'signup';

export function AuthForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyUserExists = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('User verification error:', err);
      return false;
    }
  };

  const createUserProfile = async (userId: string, selectedRole: UserRole) => {
    try {
      // Verificar si ya existe un perfil
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        console.log('Profile already exists');
        return;
      }

      // Try to delete any existing presence record first (in case it's stuck)
      await supabase
        .from('user_presence')
        .delete()
        .eq('user_id', userId);

      // Create the profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: selectedRole,
          full_name: '',
          location: '',
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;
    } catch (err) {
      console.error('Profile creation error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      if (mode === 'signup') {
        if (!role) {
          throw new Error('Please select a role');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
  
        // Just do the auth signup first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });
  
        if (signUpError) throw signUpError;
  
        if (!signUpData.user?.id) {
          throw new Error('User creation failed');
        }
  
        // Create the profile
        await createUserProfile(signUpData.user.id, role);
          
        navigate('/profile/setup');
      } else {
        // Sign in logic
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (!signInData.user) {
          throw new Error('Sign in failed');
        }

        // Verificar y crear perfil si es necesario
        await createUserProfile(signInData.user.id, 'business');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      await supabase.auth.signOut();
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:text-primary-hover"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-primary hover:text-primary-hover"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        {mode === 'signup' && (
          <>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                I want to...
              </label>
              <div className="mt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => setRole('business')}
                  className={`w-full py-2 px-4 rounded-md border ${
                    role === 'business'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Hire Freelancers (Business)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`w-full py-2 px-4 rounded-md border ${
                    role === 'freelancer'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Work as a Freelancer
                </button>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}