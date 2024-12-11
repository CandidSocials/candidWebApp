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

  const createUserProfile = async (userId: string, selectedRole: UserRole) => {
    try {
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

        // First, sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            }
          }
        });

        if (signUpError) throw signUpError;

        if (!signUpData.user?.id) {
          throw new Error('User creation failed');
        }

        // Wait a short moment to ensure the user is fully created in the auth system
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Then create the profile
        await createUserProfile(signUpData.user.id, role);
        
        navigate('/profile/setup');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      // If there's an error, attempt to sign out to clean up any partial state
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
                className="text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-indigo-600 hover:text-indigo-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    role === 'business'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'hover:border-indigo-500'
                  }`}
                >
                  <span className="font-medium">Hire Talent</span>
                  <p className="text-sm text-gray-500">I'm a business looking to hire</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    role === 'freelancer'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'hover:border-indigo-500'
                  }`}
                >
                  <span className="font-medium">Work as a Freelancer</span>
                  <p className="text-sm text-gray-500">I want to offer my services</p>
                </button>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading || (mode === 'signup' && !role)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          ) : mode === 'signin' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}