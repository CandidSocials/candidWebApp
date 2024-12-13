import { Clock, CheckCircle2, XCircle, Clock4 } from 'lucide-react';

interface JobStatusBadgeProps {
  status: string;
  jobStatus?: string;
}

export function JobStatusBadge({ status, jobStatus }: JobStatusBadgeProps) {
  if (status === 'accepted' && jobStatus === 'in_progress') {
    return (
      <span className="flex items-center px-3 py-1 mt-4 rounded-full text-sm bg-blue-100 text-blue-800">
        <Clock4 className="h-4 w-4 mr-1" />
        In Progress
      </span>
    );
  }

  switch (status) {
    case 'accepted':
      return (
        <span className="flex items-center px-3 py-1 mt-4 rounded-full text-sm bg-green-100 text-green-800">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Accepted
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center px-3 py-1 mt-4 rounded-full text-sm bg-red-100 text-red-800">
          <XCircle className="h-4 w-4 mr-1" />
          Rejected
        </span>
      );
    case 'pending':
      return (
        <span className="flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
          <Clock className="h-4 w-4 mr-1" />
          Pending
        </span>
      );
    default:
      return null;
  }
}