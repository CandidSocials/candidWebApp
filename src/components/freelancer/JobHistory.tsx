import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface JobApplication {
  id: string
  job_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  job: {
    title: string
    company_name: string
    status: 'open' | 'closed'
  }
}

interface JobHistoryProps {
  freelancerId: string
}

export function JobHistory({ freelancerId }: JobHistoryProps) {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApplications() {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          status,
          created_at,
          job:job_listings (
            title,
            company_name,
            status
          )
        `)
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setApplications(data)
      }
      setLoading(false)
    }

    fetchApplications()
  }, [freelancerId])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{application.job.title}</h3>
              <p className="text-gray-600">{application.job.company_name}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm ${
              application.status === 'accepted' 
                ? 'bg-green-100 text-green-800'
                : application.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {application.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 