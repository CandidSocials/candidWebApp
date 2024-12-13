import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthForm } from './components/auth/AuthForm';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { BrowseJobs } from './pages/BrowseJobs';
import { BrowseTalent } from './pages/BrowseTalent';
import { AuthProvider } from './lib/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleSelection } from './components/auth/RoleSelection';
import { ProfileSetup } from './pages/ProfileSetup';
import { Profile } from './pages/Profile';
import { LandingPage } from './pages/LandingPage';
import { MyJobs } from './pages/MyJobs';
import { FreelancerPublicProfile } from './components/freelancer/FreelancerPublicProfile';
import { FreelancerDirectory } from './pages/FreelancerDirectory';
import { FreelancerProfile } from './pages/FreelancerProfile';
import { Chats } from './pages/Chats';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route
                path="/role-selection"
                element={
                  <ProtectedRoute>
                    <RoleSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/setup"
                element={
                  <ProtectedRoute>
                    <ProfileSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <BrowseJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-jobs"
                element={
                  <ProtectedRoute>
                    <MyJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/talent"
                element={
                  <ProtectedRoute>
                    <BrowseTalent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/:id"
                element={
                  <ProtectedRoute>
                    <FreelancerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancers"
                element={
                  <ProtectedRoute>
                    <FreelancerDirectory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats"
                element={
                  <ProtectedRoute>
                    <Chats />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;