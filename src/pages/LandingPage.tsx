import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, MapPin, Shield, DollarSign, Clock, Lock, SearchIcon, Camera, Video } from 'lucide-react'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-16 sm:py-24 gap-12">
          {/* Left side content */}
          <div className="lg:w-1/2 space-y-6 mb-32">
            <h1 className="text-5xl sm:text-6xl font-normal text-primary tracking-tight ">
              Find Local Talent Near You At Candid App
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search services near you..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#003912] text-white p-2 rounded-lg">
                <SearchIcon className="h-5 w-5 p-0.5" />
              </button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-normal text-primary">30+</div>
                <div className="text-gray-600 font-bold">Live Gigs</div>
              </div>
              <div>
                <div className="text-2xl font-normal text-primary">20+</div>
                <div className="text-gray-600 font-bold">Creative Professionals</div>
              </div>
              <div>
                <div className="text-2xl font-normal text-primary">50+</div>
                <div className="text-gray-600 font-bold">Satisfied Businesses</div>
              </div>
            </div>
          </div>
          
          {/* Right side images */}
          <div className="lg:w-1/2 relative mt-12 lg:mt-0">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="rounded-full h-fit mt-24">
                <img src="src\static\LandingPage\hero-2.webp" alt="Photographer" className="rounded-lg" />
              </div>
              <div className="rounded-full">
                <img src="src\static\LandingPage\hero-1.webp" alt="Videographer" className="rounded-lg" />
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -z-10 top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#E6F7F4] rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Service Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-primary/10 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Book the Best Photographers for Unforgettable Moments</h3>
          </div>
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-primary/10 rounded-full">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Hire the Top Videographers for Every Occasion</h3>
          </div>
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-primary/10 rounded-full">
             <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Book the Best Photographers for Unforgettable Moments</h3>
          </div>
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