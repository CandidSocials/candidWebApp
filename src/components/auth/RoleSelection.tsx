import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../lib/types';
import { useAuth } from '../../lib/AuthProvider';

export function RoleSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelection = async (role: UserRole) => {
    setLoading(true);
    setError('');

    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user?.id,
            role,
            full_name: user?.user_metadata?.full_name || '',
            location: '',
          },
        ]);

      if (profileError) throw profileError;
      navigate('/profile/setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Choose Your Role</h2>
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelection('business')}
          disabled={loading}
          className="w-full p-4 text-left border rounded-lg hover:border-primary-hover focus:border-primary-hover focus:ring-2 focus:ring-primary transition-colors"
        >
          <h3 className="text-lg font-semibold">Business Owner</h3>
          <p className="text-gray-600">I want to hire talented professionals</p>
        </button>
        <button
          onClick={() => handleRoleSelection('freelancer')}
          disabled={loading}
          className="w-full p-4 text-left border rounded-lg hover:border-primary-hover focus:border-primary-hover focus:ring-2 focus:ring-primary transition-colors"
        >
          <h3 className="text-lg font-semibold">Freelancer</h3>
          <p className="text-gray-600">I want to offer my services</p>
        </button>
      </div>
    </div>
  );
}