import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface UseJobStatusProps {
  jobId: string
  onStatusChange?: (newStatus: string) => void
}

export function useJobStatus({ jobId, onStatusChange }: UseJobStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateJobStatus = async (newStatus: 'open' | 'closed' | 'in_progress') => {
    setIsUpdating(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('job_listings')
        .update({ status: newStatus })
        .eq('id', jobId)

      if (updateError) throw updateError

      onStatusChange?.(newStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating job status')
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    isUpdating,
    error,
    updateJobStatus
  }
} 