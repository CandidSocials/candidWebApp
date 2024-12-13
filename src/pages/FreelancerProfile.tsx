import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Star, MapPin, Clock, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ReviewsList } from '../components/freelancer/ReviewsList'
import { PortfolioList } from '../components/freelancer/PortfolioList'
import { SkillsList } from '../components/freelancer/SkillsList'
import { JobHistory } from '../components/freelancer/JobHistory'
import { DirectOfferModal } from '../components/freelancer/DirectOfferModal'
import { useProfile } from '../lib/useProfile'

interface FreelancerProfile {
  user_id: string
  full_name: string
  bio: string
  location: string
  skills: string[]
  average_rating: number
  total_reviews: number
  portfolio_items: Array<{
    title: string
    description: string
  }>
  hourly_rate: number
  availability_status: 'available' | 'busy' | 'unavailable'
}

export function FreelancerProfile() {
  const { id } = useParams<{ id: string }>()
  const { profile: currentUserProfile } = useProfile()
  const [profile, setProfile] = useState<FreelancerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDirectOfferModal, setShowDirectOfferModal] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [id])

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          full_name,
          bio,
          location,
          skills,
          average_rating,
          total_reviews,
          portfolio_items,
          hourly_rate,
          availability_status
        `)
        .eq('user_id', id)
        .eq('role', 'freelancer')
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!profile) return <div>Profile not found</div>

  const canSendDirectOffer = currentUserProfile?.role === 'business'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
            <div className="flex items-center mt-2 text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {profile.location}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-gray-900">{profile.average_rating.toFixed(1)}</span>
              <span className="ml-1 text-gray-500">({profile.total_reviews} reviews)</span>
            </div>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
              profile.availability_status === 'available' 
                ? 'bg-green-100 text-green-800'
                : profile.availability_status === 'busy'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {profile.availability_status}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-900">About</h2>
          <p className="mt-2 text-gray-600">{profile.bio}</p>
        </div>

        <div className="mt-4 flex items-center text-gray-600">
          <Briefcase className="h-4 w-4 mr-2" />
          <span>${profile.hourly_rate}/hour</span>
        </div>

        {canSendDirectOffer && (
          <button
            onClick={() => setShowDirectOfferModal(true)}
            className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors"
          >
            Send Direct Offer
          </button>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
        <SkillsList skills={profile.skills} />
      </div>

      {/* Portfolio Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h2>
        <PortfolioList items={profile.portfolio_items} />
      </div>

      {/* Job History Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job History</h2>
        <JobHistory freelancerId={profile.user_id} />
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
        <ReviewsList freelancerId={profile.user_id} />
      </div>

      {showDirectOfferModal && (
        <DirectOfferModal
          freelancerId={profile.user_id}
          freelancerName={profile.full_name}
          onClose={() => setShowDirectOfferModal(false)}
          onSuccess={() => {
            setShowDirectOfferModal(false);
          }}
        />
      )}
    </div>
  )
}