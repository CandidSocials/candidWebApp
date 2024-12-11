import { useState } from 'react'
import { useJobStatus } from '../../hooks/useJobStatus'

interface ApplicationActionsProps {
  jobId: string
  applicationId: string
  currentStatus: string
  onStatusChange: () => void
}

export function ApplicationActions({
  jobId,
  applicationId,
  currentStatus,
  onStatusChange
}: ApplicationActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { updateJobStatus, isUpdating } = useJobStatus({
    jobId,
    onStatusChange: () => onStatusChange()
  })

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      // Actualizar estado de la aplicación
      const { error: applicationError } = await supabase
        .from('job_applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId)

      if (applicationError) throw applicationError

      // Actualizar estado del trabajo
      await updateJobStatus('in_progress')

      onStatusChange()
    } catch (error) {
      console.error('Error accepting application:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAccept}
        disabled={isProcessing || isUpdating || currentStatus !== 'pending'}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentStatus === 'pending'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isProcessing || isUpdating ? 'Processing...' : 'Accept'}
      </button>
      {/* Otros botones de acción */}
    </div>
  )
} 