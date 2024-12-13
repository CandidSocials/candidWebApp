import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
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
          <div className="flex items-center w-fit">
            <button
              onClick={handleLogoClick}
              className="flex items-center"
            >
              <img src="src\static\nav-logo.png" width="150px" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-primary hover:text-primary-hover"
                >
                  Dashboard
                </button>
                {profile.role === 'freelancer' && (
                  <button
                    onClick={() => navigate('/jobs')}
                    className="text-primary hover:text-primary-hover"
                  >
                    Job Listings
                  </button>
                )}
                {profile.role === 'business' && (
                  <button
                    onClick={() => navigate('/my-jobs')}
                    className="text-primary hover:text-primary-hover"
                  >
                    My Jobs
                  </button>
                )}
                <button
                  onClick={() => navigate('/profile')}
                  className="text-primary hover:text-primary-hover"
                >
                  Profile
                </button>
                {profile.role === 'business' && (
                  <Link
                    to="/freelancers"
                    className="text-primary hover:text-primary-hover"
                  >
                    Browse Freelancers
                  </Link>
                )}
                
                <Link
                  to="/chats"
                  className="text-primary hover:text-primary-hover flex items-center"
                >
                  <MessageSquare className="h-5 w-5 mr-1" />
                  Chats
                </Link>
                <NotificationBell />
                <button
                  onClick={handleSignOut}
                  className="text-primary hover:text-primary-hover"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
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