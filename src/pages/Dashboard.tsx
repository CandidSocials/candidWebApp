import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../lib/useProfile';
import { JobListingForm } from '../components/business/JobListingForm';
import { MyApplications } from '../components/MyApplications';
import { TalentListingModal } from '../components/talent/TalentListingModal';
import { JobListingModal } from '../components/job/JobListingModal.tsx';
import { Toast } from './Toast.tsx';
import { 
  LayoutGrid, 
  MessageSquare, 
  Users, 
  Briefcase, 
  UserCircle,
  PlusCircle,
  ListPlus
} from 'lucide-react';

export function Dashboard() {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [isListingModalOpen, setListingModalOpen] = useState(false);
  const [isJobModalOpen, setJobModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const handleListingSuccess = () => {
    setListingModalOpen(false);
    setToastMessage('Your talent listing has been created successfully!');
    setShowToast(true);
  };

  const handleJobSuccess = () => {
    setJobModalOpen(false);
    setToastMessage('Your job posting has been created successfully!');
    setShowToast(true);
    navigate('/my-jobs');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-red-600 p-4">
        Profile not found. Please complete your profile setup.
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getWelcomeMessage = () => {
    if (profile.role === 'business') {
      return "Welcome to your business dashboard. Here you can manage your job postings and find talented freelancers for your projects.";
    }
    return "Welcome to your freelancer dashboard. Here you can manage your listings and track your job applications.";
  };

  const navigationCards = profile.role === 'business' ? [
    { icon: <Users className="h-6 w-6" />, title: 'Browse Freelancers', path: '/freelancers' },
    { icon: <Briefcase className="h-6 w-6" />, title: 'My Jobs', path: '/my-jobs' },
    { icon: <MessageSquare className="h-6 w-6" />, title: 'Messages', path: '/chats' },
    { icon: <UserCircle className="h-6 w-6" />, title: 'Profile', path: '/profile' }
  ] : [
    { icon: <Briefcase className="h-6 w-6" />, title: 'Job Listings', path: '/jobs' },
    { icon: <MessageSquare className="h-6 w-6" />, title: 'Messages', path: '/chats' },
    { icon: <UserCircle className="h-6 w-6" />, title: 'Profile', path: '/profile' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {profile.full_name}!
          </h1>
          <p className="text-lg opacity-90">
            {getWelcomeMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full justify-end">
          {profile.role === 'freelancer' && (
            <button
              onClick={() => setListingModalOpen(true)}
              className="bg-primary text-white w-full md:w-fit px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors duration-200 flex items-center space-x-2 justify-center"
            >
              <ListPlus className="h-5 w-5" />
              <span>Create Talent Listing</span>
            </button>
          )}
          {profile.role === 'business' && (
            <button
              onClick={() => setJobModalOpen(true)}
              className="bg-primary text-white w-full md:w-fit px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors duration-200 flex items-center space-x-2 justify-center"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Job Posting</span>
            </button>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navigationCards.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center space-y-2"
            >
              {card.icon}
              <span className="text-gray-700 font-medium">{card.title}</span>
            </button>
          ))}
        </div>

        {/* Applications Section for Freelancers */}
        {profile.role === 'freelancer' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                My Applications
              </h2>
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <MyApplications />
          </div>
        )}
      </div>

      {/* Modals */}
      <TalentListingModal 
        isOpen={isListingModalOpen}
        onClose={() => setListingModalOpen(false)}
      />
      
      <JobListingModal 
        isOpen={isJobModalOpen}
        onClose={() => setJobModalOpen(false)}
        //onSuccess={handleJobSuccess}
      />

      {/* Success Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}