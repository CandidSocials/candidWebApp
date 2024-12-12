import { useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthProvider'

interface ReviewFormProps {
  freelancerId: string
  onClose: () => void
  onSuccess: () => void
}

const isDev = process.env.NODE_ENV === 'development'

export function ReviewForm({ freelancerId, onClose, onSuccess }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: reviewError } = await supabase
        .from('freelancer_reviews')
        .insert([
          {
            freelancer_id: freelancerId,
            business_id: user?.id,
            rating,
            comment,
          },
        ])

      if (reviewError) throw reviewError

      // Create notification for the freelancer
      await supabase.from('notifications').insert([
        {
          user_id: freelancerId,
          type: 'new_review',
          title: 'New Review Received',
          message: `You have received a new ${rating}-star review`,
          data: {
            rating,
            business_id: user?.id,
          },
        },
      ])

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting review')
    } finally {
      setLoading(false)
    }
  }

  // Función de prueba
  const handleTestReview = async () => {
    try {
      const { error: reviewError } = await supabase
        .from('freelancer_reviews')
        .insert([
          {
            freelancer_id: freelancerId,
            business_id: user?.id,
            rating: 5,
            comment: 'Test review: Great work and very professional!',
          },
        ])

      if (reviewError) throw reviewError
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting test review')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Write Review</h2>
        
        {/* Añade el botón de prueba solo en desarrollo */}
        {isDev && (
          <button
            onClick={handleTestReview}
            className="mb-4 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
          >
            Insert Test Review
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hoverrounded-md disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 