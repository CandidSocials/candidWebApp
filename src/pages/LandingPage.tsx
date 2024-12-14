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
    <div className="max-w-full px-4 sm:px-6 lg:px-8 items-center flex flex-col">
      
      {/* Hero Section */}
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-1 mb-[100px] md:mb-32 flex items-center flex-col ">
      <img src="src\static\LandingPage\hero-bg.png" className=' absolute w-full object-contain z-[-10] ' />
        <div className="flex flex-col lg:flex-row items-center justify-between py-16 sm:py-24 gap-12">
          {/* Left side content */}
          <div className="lg:w-1/2 space-y-6 mb-32 z-30">
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
          <div className="lg:w-1/2 relative mt-12 lg:mt-0 z-1">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="rounded-full h-fit mt-24">
                <img src="src\static\LandingPage\hero-2.webp" alt="Photographer" className="rounded-lg" />
              </div>
              <div className="rounded-full">
                <img src="src\static\LandingPage\hero-1.webp" alt="Videographer" className="rounded-lg" />
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -z-10 top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-transparent rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Service Icons */}
        <div className="w-[80%] grid grid-cols-1 md:grid-cols-3 gap-8 py-12 z-[10] bg-white mt-[-180px] rounded-xl">
          <div className="text-left space-y-4  z-1">
            <img src="src\static\LandingPage\hero-item-1.png" className='w-12 h-12' />
            <h3 className="text-gray-700 font-semibold">Book the Best Photographers for Unforgettable Moments</h3>
          </div>
          
          <div className="text-left space-y-4  z-1">
            <img src="src\static\LandingPage\hero-item-2.png" className='w-12 h-12' />
            <h3 className="text-gray-700 font-semibold">Hire the Top Videographers for Every Occasion</h3>
          </div>

          <div className="text-left space-y-4  z-1">
            <img src="src\static\LandingPage\hero-item-3.png" className='w-12 h-12' />
            <h3 className="text-gray-700 font-semibold">Book the Best Photographers for Unforgettable Moments</h3>
          </div>
        </div>
      </div>
      {/* How it works */}
        <div className='flex fles-col w-full mx-24 items-center justify-end mb-40'>
          <div className='flex flex-col gap-12 px-12 w-[35%] absolute left-24 bg-white z-10  py-10 rounded-2xl'>
            {/* Step 1 */}
            <h3 className='text-[#0A2B14] text-2xl font-semibold' >How it works</h3>
            <div className='flex flex-row gap-4 items-center'>
              <img src="src\static\LandingPage\num-1.png" className='w-12 h-12' />
              <p className="text-[#0A2B14] text-base font-semibold">List Your Creative Task: Describe the content you need—be it photography, videography, or editing.</p>
            </div>
             {/* Step 2 */}
            <div className='flex flex-row gap-4 items-center'>
              <img src="src\static\LandingPage\num-2.png" className='w-12 h-12' />
              <p className="text-[#0A2B14] text-base font-semibold">Receive Offers: Get personalized bids from talented local creatives.</p>
            </div>
             {/* Step 3 */}
            <div className='flex flex-row gap-4 items-center'>
              <img src="src\static\LandingPage\num-3.png" className='w-12 h-12' />
              <p className="text-[#0A2B14] text-base font-semibold">Choose and Collaborate: Pick your creative partner, communicate directly, and bring your vision to life.</p>
            </div>
          </div>
          <img src="src/static/LandingPage/how-it-works.png" className='w-[85%] h-auto rounded-lg' />
        </div>

        {/* The local content solution... */}
        <div className="flex flex-col w-full mb-12 items-left justify-start gap-0 h-fit">
        <img src="src\static\LandingPage\hero-bg.png" className=' left-0 absolute w-full h-auto object-contain overflow-hidden z-[-10] ' />
          <h3 className='w-1/2 text-4xl mb-12'>
            The <span className="text-primary">local</span> content solution for businesses & creatives
          </h3>
          <div className='w-full flex flex-row gap-0 mb-24'>
          
          <div className="w-full grid grid-cols-2 gap-8">
            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-semibold">Only Local Creatives</h2>
              <p className="font-normal">Connect with talented professionals in your area who truly "get it"—the local trends, culture, and vibe. Build real connections, face-to-face, with creatives who bring your vision to life in ways only locals can.</p>
            </div>
            
            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-semibold">Get Multiple Offers</h2>
              <p className="font-normal">Request bids directly from freelancers who capture your attention, or compare multiple offers to find the perfect fit for your project’s needs and budget.</p>
            </div>

            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-semibold">Ratings & Reviews</h2>
              <p className="font-normal">Make confident choices based on honest feedback from previous clients.</p>
            </div>

            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-semibold">Everything In One Place</h2>
              <p className="font-normal">Manage everything seamlessly—review bids, communicate with creatives, and make secure payments, all on one platform.</p>
            </div>
          </div>
          <div className='w-full'>
            <img src="src\static\LandingPage\placeholder.png" />
          </div>
          
        </div>
          <button className='flex mt-[-50px] bg-primary w-fit px-8 h-12 justify-center items-center rounded-lg hover:bg-primary-hover'> <h3 className='text-white font-semibold text-lg'>Try Now</h3> </button>
        </div>
       

        <div className='w-full flex flex-col mt-12 mb-12 gap-12 bg-white'>
          <h3 className="w-1/2 text-4xl mb-12">Make it all happen <span className='text-primary'>locally.</span></h3>

          <div className='grid grid-cols-4 w-full gap-32 justify-center items-center'>
            {/* Number 1 */}
            <div className='flex flex-col gap-6'>
              <img src="src\static\LandingPage\char-1.png" className='w-12 h-12'/>
              <h3 className="text-[#404145]">
                Access Local Talent: Tap into a dedicated pool of skilled creatives in your community who understand your unique needs and vision.
              </h3>
            </div>
            {/* Number 2 */}
            <div className='flex flex-col gap-6'>
              <img src="src\static\LandingPage\char-2.png" className='w-12 h-12'/>
              <h3 className="text-[#404145]">
                Simple and Easy-to-Use: A user-friendly platform designed to make finding, hiring, and working with local professionals as straightforward as possible.
              </h3>
            </div>
            {/* Number 3 */}
            <div className='flex flex-col gap-6'>
              <img src="src\static\LandingPage\char-3.png" className='w-12 h-12'/>
              <h3 className="text-[#404145]">
                Quick Turnaround: Collaborate with nearby talent for faster communication, quick delivery, and real-time collaboration.
              </h3>
            </div>
            {/* Number 4 */}
            <div className='flex flex-col gap-6'>
              <img src="src\static\LandingPage\char-4.png" className='w-12 h-12'/>
              <h3 className="text-[#404145]">
              Only pay when you’re happy
              </h3>
            </div>
          </div>



          <button className='flex bg-primary w-fit px-8 h-12 justify-center items-center rounded-lg hover:bg-primary-hover'> <h3 className='text-white font-semibold text-lg'>Join Now</h3> </button>
        </div>
    
        {/* CTA */}
        <div className="grid grid-cols-2 h-fit  mb-12 rounded-full">
          <div className="relative bg-cover h-full bg-center bg-no-repeat object-left overflow-hidden rounded-tl-xl rounded-bl-xl" style={{ backgroundImage: "url('src\\/static\\/LandingPage\\/CTA-1.png')" }}>
            <div className="relative z-10 flex flex-col justify-center items-start h-full px-12 gap-8 rounded-xl">
              <h1 className="text-5xl font-normal text-white mb-4">Your Next Big Idea Starts Here, Locally.</h1>
              <a href="/auth" className="bg-white text-black font-medium py-3 px-6 rounded-md hover:bg-gray-200 transition-colors">
                JOIN CANDID
              </a>
            </div>
          </div>
          <div className="bg-gray-100 flex items-center justify-center">
            <img src="src\static\LandingPage\CTA-2.png" />
          </div>
        </div>
      </div>
  );
}