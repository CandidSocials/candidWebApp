import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthForm } from '@/components/auth/AuthForm';
import { RoleSelection } from '@/components/auth/RoleSelection';
import { Dashboard } from '@/pages/Dashboard';
import { BrowseJobs } from '@/pages/BrowseJobs';
import { BrowseTalent } from '@/pages/BrowseTalent';
import { ProfileSetup } from '@/pages/ProfileSetup';
import { Profile } from '@/pages/Profile';
import { LandingPage } from '@/pages/LandingPage';
import { MyJobs } from '@/pages/MyJobs';
import { FreelancerProfile } from '@/pages/FreelancerProfile';
import { FreelancerDirectory } from '@/pages/FreelancerDirectory';
import { Chats } from '@/pages/Chats';
import { Layout } from '@/components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'auth',
        element: <AuthForm />
      },
      {
        path: 'role-selection',
        element: (
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'jobs',
        element: (
          <ProtectedRoute>
            <BrowseJobs />
          </ProtectedRoute>
        )
      },
      {
        path: 'my-jobs',
        element: (
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        )
      },
      {
        path: 'talent',
        element: (
          <ProtectedRoute>
            <BrowseTalent />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile/setup',
        element: (
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        )
      },
      {
        path: 'freelancer/:id',
        element: (
          <ProtectedRoute>
            <FreelancerProfile />
          </ProtectedRoute>
        )
      },
      {
        path: 'freelancers',
        element: (
          <ProtectedRoute>
            <FreelancerDirectory />
          </ProtectedRoute>
        )
      },
      {
        path: 'chats',
        element: (
          <ProtectedRoute>
            <Chats />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);