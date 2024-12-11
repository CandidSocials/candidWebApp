import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { JobListing } from '../lib/types';
import { useAuth } from '../lib/AuthProvider';
import { MapPin, Clock, DollarSign, Pencil, Trash2, Users } from 'lucide-react';
import { EditJobModal } from '../components/job/EditJobModal';
import { DeleteConfirmationModal } from '../components/job/DeleteConfirmationModal';
import { JobApplicationsListModal } from '../components/job/JobApplicationsListModal';

export function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobListing | null>(null);
  const [viewingApplications, setViewingApplications] = useState<JobListing | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setDeletingJob(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Job Listings</h1>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          You haven't posted any jobs yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
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
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setViewingApplications(job)}
                    className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Applications
                  </button>
                  <button
                    onClick={() => setEditingJob(job)}
                    className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingJob(job)}
                    className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={() => {
            fetchJobs();
            setEditingJob(null);
          }}
        />
      )}

      {deletingJob && (
        <DeleteConfirmationModal
          title={deletingJob.title}
          onConfirm={() => handleDelete(deletingJob.id)}
          onCancel={() => setDeletingJob(null)}
        />
      )}

      {viewingApplications && (
        <JobApplicationsListModal
          job={viewingApplications}
          onClose={() => setViewingApplications(null)}
        />
      )}
    </div>
  );
}