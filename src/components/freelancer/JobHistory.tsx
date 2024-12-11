import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Clock, Briefcase } from 'lucide-react'

interface JobApplication {
  id: string
  job_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  job: {
    title: string
    company_name: string
    status: 'open' | 'closed' | 'in_progress'
    description: string
    budget: number
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
            status,
            description,
            budget
          )
        `)
        .eq('freelancer_id', freelancerId)
        .eq('status', 'accepted')
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
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-500 line-clamp-2">
                  {application.job.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Briefcase className="w-4 h-4 mr-1" />
                    ${application.job.budget}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-2 py-1 rounded-full text-sm ${
                application.job.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : application.job.status === 'closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {application.job.status === 'in_progress' ? 'In Progress' : 
                 application.job.status === 'closed' ? 'Completed' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 