import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, MapPin, Shield, DollarSign, Clock, Lock, SearchIcon, Camera, Video } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { JobListing } from '../lib/types'
import { useAuth } from '../lib/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { JobApplicationModal } from '../components/job/JobApplicationModal'

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth()
  const [recentJobs, setRecentJobs] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)

  useEffect(() => {
    console.log('LandingPage useEffect triggered');
    async function fetchRecentJobs() {
      console.log('Iniciando fetchRecentJobs...');
      try {
        if (!supabase) {
          console.error('Supabase client no está inicializado');
          return;
        }

        console.log('Auth state:', { user });
        console.log('Realizando consulta a Supabase...');
        
        const { data, error } = await supabase
          .from('job_listings_with_profiles')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(6);

        console.log('Respuesta de Supabase:', { data, error });

        if (error) {
          console.error('Error al obtener trabajos:', error);
          return;
        }

        if (data) {
          console.log('Datos recibidos:', data);
          console.log('Estructura del primer trabajo:', data[0]);
          setRecentJobs(data);
        } else {
          console.log('No se recibieron datos');
        }
      } catch (err) {
        console.error('Error en fetchRecentJobs:', err);
      }
    }

    fetchRecentJobs();
  }, [user])

  return (
    <div className="font-poppins font-normal  w-full px-0 lg:px-8 items-center flex flex-col">
      
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 z-1 mb-[100px] md:mb-32 flex items-center flex-col ">
      <img src="src\static\LandingPage\hero-bg.png" className=' hidden md:absolute w-full object-contain z-[-10] ' />
        <div className="flex flex-col lg:flex-row items-center justify-between py-16 sm:py-24 gap-0 lg:gap-12">
          {/* Left side content */}
          <div className=" lg:w-1/2 space-y-6 mb-32 z-30">
            <h1 className="font-poppins font-normal md:text-5xl text-4xl text-primary tracking-tight ">
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
                <div className="text-gray-600 font-semibold">Live Gigs</div>
              </div>
              <div>
                <div className="text-2xl font-normal text-primary">20+</div>
                <div className="text-gray-600 font-semibold">Creative Professionals</div>
              </div>
              <div>
                <div className="text-2xl font-normal text-primary">50+</div>
                <div className="text-gray-600 font-semibold">Satisfied Businesses</div>
              </div>
            </div>
          </div>
          
          {/* Right side images */}
          <div className="lg:w-1/2 relative mt-0 lg:mt-12 z-1">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="rounded-full h-fit mt-6 lg:mt-24">
                <img src="src\static\LandingPage\hero-2.webp" alt="Photographer" className="rounded-lg" />
              </div>
              <div className="rounded-full">
                <img src="src\static\LandingPage\hero-1.webp" alt="Videographer" className="rounded-lg" />
              </div>
            </div>
            {/* Background decoration */}
            
          </div>
        </div>

        {/* Service Icons */}
        <div className="shadow-lg lg:shadow-none w-[80%] grid grid-cols-1 lg:grid-cols-3 gap-24 px-10 lg:px-24 py-12 z-[10] bg-white mt-[-180px] rounded-xl">
          <div className="text-left space-y-4  z-1">
            <img src="src\static\LandingPage\hero-item-1.png" className='w-12 h-12' />
            <h3 className="text-gray-600 font-medium">Book the Best Photographers for Unforgettable Moments</h3>
          </div>
          
          <div className="text-left space-y-4  z-1">
            <img src="src\static\LandingPage\hero-item-2.png" className='w-12 h-12' />
            <h3 className="text-gray-600 font-medium">Hire the Top Videographers for Every Occasion</h3>
          </div>

          <div className="text-left space-y-4  z-1">
            <img src="src\static\LandingPage\hero-item-3.png" className='w-12 h-12' />
            <h3 className="text-gray-600 font-medium">Book the Best Photographers for Unforgettable Moments</h3>
          </div>
        </div>
      </div>
      {/* How it works */}
        <div className='flex flex-col w-full mx-4 md:mx-24 items-center justify-center mb-12 lg:mb-40'>
          <div className='flex flex-col gap-8 lg:gap-12 px-2 md:px-12 w-full shadow-lg mb-4 md:w-[50%] lg:w-[40%] xl:w-[35%] md:absolute left-0 2xl:left-24 bg-white z-10 py-12 rounded-2xl'>
            {/* Step 1 */}
            <h3 className='text-[#0A2B14] text-2xl font-semibold' >How it works</h3>
            <div className='flex flex-col md:flex-row gap-4 items-left md:items-center'>
              <img src="src\static\LandingPage\num-1.png" className='w-8 h-8 md:w-12 md:h-12' />
              <p className="text-[#0A2B14] text-lg font-semibold">List Your Creative Task: Describe the content you need—be it photography, videography, or editing.</p>
            </div>
             {/* Step 2 */}
            <div className='flex flex-col md:flex-row gap-4 items-left md:items-center'>
              <img src="src\static\LandingPage\num-2.png" className='w-8 h-8 md:w-12 md:h-12' />
              <p className="text-[#0A2B14] text-lg font-semibold">Receive Offers: Get personalized bids from talented local creatives.</p>
            </div>
             {/* Step 3 */}
            <div className='flex flex-col md:flex-row gap-4 items-left md:items-center'>
              <img src="src\static\LandingPage\num-3.png" className='w-8 h-8 md:w-12 md:h-12' />
              <p className="text-[#0A2B14] text-lg font-semibold">Choose and Collaborate: Pick your creative partner, communicate directly, and bring your vision to life.</p>
            </div>
          </div>
          <img src="src/static/LandingPage/how-it-works.png" className='w-full md:w-[85%] h-[80vh] md:h-screen object-cover rounded-lg' />
        </div>

        {/* The local content solution... */}
        <div className="flex flex-col w-full mb-0 lg:mb-12 items-left justify-start gap-0 h-fit">
        <img src="src\static\LandingPage\hero-bg.png" className=' left-0 hidden md:absolute w-full h-auto object-contain overflow-hidden z-[-10] ' />
          <h3 className='text-[#222325] w-full lg:w-1/2 text-4xl mb-12 font-medium'>
            The <span className="text-primary ">local</span> content solution for businesses & creatives
          </h3>
          <div className='w-full flex flex-col lg:flex-row gap-12 mb-0 lg:mb-24'>
          
          <div className="w-full grid grid-cols-1 gap-8 text-[#222325]">
            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-normal mb-2 mt-2">Only Local Creatives</h2>
              <p className="font-normal">Connect with talented professionals in your area who truly "get it"—the local trends, culture, and vibe. Build real connections, face-to-face, with creatives who bring your vision to life in ways only locals can.</p>
            </div>
            
            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-normal mb-2 mt-2">Get Multiple Offers</h2>
              <p className="font-normal">Request bids directly from freelancers who capture your attention, or compare multiple offers to find the perfect fit for your project’s needs and budget.</p>
            </div>

            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-normal mb-2 mt-2">Ratings & Reviews</h2>
              <p className="font-normal">Make confident choices based on honest feedback from previous clients.</p>
            </div>

            <div>
              <img src="src\static\LandingPage\check.png" className="w-4 h-4" />
              <h2 className="text-2xl font-normal mb-2 mt-2">Everything In One Place</h2>
              <p className="font-normal">Manage everything seamlessly—review bids, communicate with creatives, and make secure payments, all on one platform.</p>
            </div>
          </div>
          <div className='w-full'>
            <img className='w-full' src="src\static\LandingPage\Landing-1.png" />
          </div>
          
        </div>
          <button 
            onClick={() => navigate('/auth')}
            className='flex mt-6 bg-primary w-fit py-2 px-8 h-12 justify-center items-center rounded-lg hover:bg-primary-hover'> 
            <h3 className='text-white font-medium text-lg'>
              Try Now
            </h3> 
          </button>
        </div>
       

        <div className='w-full flex flex-col mt-12 mb-12 gap-2 lg:gap-12 bg-white rounded-xl'>
          <h3 className="w-full md:w-1/2 text-4xl mb-12 text-[#222325] font-medium">Make it all happen <span className='text-primary'>locally.</span></h3>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-12 lg:gap-32 justify-center items-center'>
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



          <button 
            onClick={() => navigate('/auth')}
            className='flex bg-primary w-fit mt-6 px-8 h-12 justify-center items-center rounded-lg hover:bg-primary-hover'> 
            <h3 className='text-white font-semibold text-lg'>
              Join Now
            </h3> 
          </button>
        </div>

        {/* Job Application Modal */}
        {selectedJob && (
          <JobApplicationModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onSuccess={() => {
              setSelectedJob(null);
              // Opcionalmente podrías recargar los trabajos aquí
              // fetchRecentJobs();
            }}
          />
        )}

        {/* CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-fit  mb-12 rounded-full w-full gap-6 lg:gap-0">
          <div className="relative bg-cover h-full bg-center bg-no-repeat object-left overflow-hidden rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-xl lg:rounded-br-none lg:rounded-tr-none lg:rounded-tl-xl " style={{ backgroundImage: "url('src\\/static\\/LandingPage\\/CTA-1.png')" }}>
            <div className="relative z-10 flex flex-col justify-center items-start h-full px-12 gap-8 rounded-xl">
              <h1 className="mt-12 lg:mt-0 text-2xl lg:text-5xl font-medium text-white mb-4">Your Next Big Idea Starts Here, Locally.</h1>
              <button 
                onClick={() => navigate('/auth')}
                className='bg-white text-[#222325] font-medium mb-12 lg:mb-0 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors'> 
                <h3 className='font-medium text-base lg:text-lg'>
                JOIN CANDID
                </h3> 
              </button>
            </div>
          </div>
          <div className="bg-white  flex items-center justify-center">
            <img className="object-cover w-full  overflow-hidden" src="src\static\LandingPage\CTA-2.png" />
          </div>
        </div>
      </div>
  );
}