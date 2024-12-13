import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, MapPin, Shield, DollarSign, Clock, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { JobListing } from '../lib/types'
import { useAuth } from '../lib/AuthProvider'
import { JobApplicationModal } from '../components/job/JobApplicationModal'

export function LandingPage() {
  const { user } = useAuth()
  const [recentJobs, setRecentJobs] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)

  useEffect(() => {
    async function fetchRecentJobs() {
      const { data } = await supabase
        .from('job_listings')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6)

      if (data) setRecentJobs(data)
    }

    fetchRecentJobs()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-16 sm:py-24">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          Find Local Talent <span className="text-primary">Near You</span> at Candid Socials
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
          Connect with skilled professionals in your area or find local businesses looking for your expertise.
        </p>
        
        <div className="mt-12 text-center">
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover"
          >
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-white rounded-xl shadow-sm">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Features</h2>
          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            <div className="text-center">
              <div className="flex justify-center">
                <MapPin className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Local Connections</h3>
              <p className="mt-2 text-base text-gray-500">
                Find talented professionals right in your neighborhood, making collaboration easier.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Verified Professionals</h3>
              <p className="mt-2 text-base text-gray-500">
                Connect with verified local talent and businesses you can trust.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Platform</h3>
              <p className="mt-2 text-base text-gray-500">
                Your data and transactions are protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nueva sección de trabajos recientes */}
      <div className="py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Recent Jobs
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Explore the latest opportunities available on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-primary">
                    {job.category}
                  </span>
                </div>
                
                {user ? (
                  <>
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
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-rimary transition-colors"
                    >
                      View Details
                    </button>
                  </>
                ) : (
                  <div className="mt-4">
                    <p className="text-gray-600 line-clamp-2">
                      {job.description.substring(0, 100)}...
                    </p>
                    <div className="mt-6 flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                      <Lock className="h-5 w-5 text-gray-400 mr-2" />
                      <Link
                        to="/auth"
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Sign in to view details
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to={user ? "/jobs" : "/auth"}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover"
          >
            {user ? "View All Jobs" : "Sign Up to See More"}
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      {user ? (
                  <>
                    <div className="text-center py-16 sm:py-24">
                      <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        <p>
                        Thank you for beign a part of <span className="text-primary">Candid Socials</span>
                        </p>
                      </h2>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 sm:py-24">
                  <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    <span className="block">Ready to get started?</span>
                    <span className="block text-primary">Join our community today.</span>
                  </h2>
                  <div className="mt-8 flex justify-center">
                    <Link
                      to="/auth"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover"
                    >
                      Sign Up Now
                    </Link>
                  </div>
                </div>
                )}
      

      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}