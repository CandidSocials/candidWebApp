import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, MapPin, Clock, DollarSign, Calendar, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthProvider'
import { ReviewForm } from './ReviewForm'
import { ReviewsList } from './ReviewsList'

interface FreelancerProfile extends UserProfile {
  average_rating: number
  total_reviews: number
  portfolio_items: Array<{
    title: string
    description: string
    image_url?: string
    link?: string
  }>
  hourly_rate: number
  availability_status: 'available' | 'busy' | 'unavailable'
}

export function FreelancerPublicProfile() {
  const { id } = useParams<{ id: string }>()
  const { user, profile: currentUserProfile } = useAuth()
  const [profile, setProfile] = useState<FreelancerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetchFreelancerProfile()
  }, [id])

  async function fetchFreelancerProfile() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          freelancer_reviews(
            rating,
            comment,
            created_at,
            business_id,
            user_profiles!business_id(full_name, company_name)
          )
        `)
        .eq('user_id', id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center text-red-600 p-4">
        {error || 'Profile not found'}
      </div>
    )
  }

  const canReview = currentUserProfile?.role === 'business'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-gray-900">{profile.average_rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">({profile.total_reviews} reviews)</span>
                </div>
                <span className={`ml-4 px-2 py-1 rounded-full text-sm ${
                  profile.availability_status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : profile.availability_status === 'busy'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.availability_status === 'available' ? 'Available' 
                    : profile.availability_status === 'busy' ? 'Busy' 
                    : 'Unavailable'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${profile.hourly_rate}/hour
              </div>
            </div>
          </div>
        </div>

        {/* Main information */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About Me</h2>
            <p className="text-gray-700">{profile.bio}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                {profile.location}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h2>
            <div className="space-y-4">
              {profile.portfolio_items?.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="mt-2 rounded-lg w-full h-48 object-cover"
                    />
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                    >
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="border-t">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              {canReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Write Review
                </button>
              )}
            </div>
            <ReviewsList freelancerId={id!} />
          </div>
        </div>
      </div>

      {showReviewForm && (
        <ReviewForm
          freelancerId={id!}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false)
            fetchFreelancerProfile()
          }}
        />
      )}
    </div>
  )
} 