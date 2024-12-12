import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { JobListing } from '../lib/types';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { JobApplicationModal } from '../components/job/JobApplicationModal';
import { useProfile } from '../lib/useProfile';

export function BrowseJobs() {
  const { profile } = useProfile();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-primary">
                  {job.category}
                </span>
              </div>
              <p className="mt-2 text-gray-600 line-clamp-3">{job.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${job.budget}
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {profile?.role === 'freelancer' && (
                <button
                  onClick={() => setSelectedJob(job)}
                  className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hovertransition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => {
            // You could add a success message or refresh the jobs list here
          }}
        />
      )}
    </div>
  );
}