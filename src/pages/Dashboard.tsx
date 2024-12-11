import { useProfile } from '../lib/useProfile';
import { CreateListingForm } from '../components/talent/CreateListingForm';
import { JobListingForm } from '../components/business/JobListingForm';
import { MyApplications } from '../components/talent/MyApplications';

export function Dashboard() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {profile.role === 'business' ? 'Create a New Job Posting' : 'Create Your Talent Listing'}
          </h1>
          {profile.role === 'business' ? <JobListingForm /> : <CreateListingForm />}
        </div>

        {profile.role === 'freelancer' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              My Applications
            </h2>
            <MyApplications />
          </div>
        )}
      </div>
    </div>
  );
}