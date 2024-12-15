import { supabase } from '../lib/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../lib/AuthProvider';
import { useProfile } from '../lib/useProfile';
import { NotificationBell } from './notifications/NotificationBell';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Primero limpiamos cualquier estado local
      localStorage.removeItem('candid-auth-token');
      
      // Luego intentamos hacer el signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        // Si hay un error, igual navegamos a home ya que hemos limpiado el estado local
      }
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      // Siempre navegamos a home y cerramos el menú, incluso si hubo un error
      navigate('/');
      setIsOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <img src="src/static/nav-logo.png" alt="Logo" className="w-32" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto">
            {user && profile ? (
              <div className="flex flex-col p-4 space-y-4">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="text-left text-gray-700 hover:text-primary"
                >
                  Dashboard
                </button>

                {profile.role === 'freelancer' && (
                  <button
                    onClick={() => handleNavigation('/jobs')}
                    className="text-left text-gray-700 hover:text-primary"
                  >
                    Job Listings
                  </button>
                )}

                {profile.role === 'business' && (
                  <>
                    <button
                      onClick={() => handleNavigation('/my-jobs')}
                      className="text-left text-gray-700 hover:text-primary"
                    >
                      My Jobs
                    </button>
                    <button
                      onClick={() => handleNavigation('/freelancers')}
                      className="text-left text-gray-700 hover:text-primary"
                    >
                      Browse Freelancers
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleNavigation('/profile')}
                  className="text-left text-gray-700 hover:text-primary"
                >
                  Profile
                </button>

                <button
                  onClick={() => handleNavigation('/chats')}
                  className="text-left text-gray-700 hover:text-primary flex items-center"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chats
                </button>

                <div className="py-2">
                  <NotificationBell />
                </div>

                <button
                  onClick={handleSignOut}
                  className="text-left text-gray-700 hover:text-primary"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-4">
                <button
                  onClick={() => handleNavigation('/auth')}
                  className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}