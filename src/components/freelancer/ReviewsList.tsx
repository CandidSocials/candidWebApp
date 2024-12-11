import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  business: {
    full_name: string
    company_name: string
  }
}

interface ReviewsListProps {
  freelancerId: string
}

export function ReviewsList({ freelancerId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('freelancer_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          business:business_id (
            full_name,
            company_name
          )
        `)
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setReviews(data)
      }
      setLoading(false)
    }

    fetchReviews()
  }, [freelancerId])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{review.business.full_name}</p>
              <p className="text-gray-600 text-sm">{review.business.company_name}</p>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  )
} 