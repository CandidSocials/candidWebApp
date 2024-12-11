import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { useAuth } from '../lib/AuthProvider';
import { NotificationBell } from './notifications/NotificationBell';

export function Navigation() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="flex items-center"
            >
              <Search className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LocalTalent</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </button>
                {profile.role === 'freelancer' && (
                  <button
                    onClick={() => navigate('/jobs')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Job Listings
                  </button>
                )}
                {profile.role === 'business' && (
                  <button
                    onClick={() => navigate('/my-jobs')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Jobs
                  </button>
                )}
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </button>
                <Link
                  to="/freelancers"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Browse Freelancers
                </Link>
                <NotificationBell />
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}