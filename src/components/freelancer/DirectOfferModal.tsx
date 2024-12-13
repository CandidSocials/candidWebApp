import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../lib/AuthProvider';
import { useDirectOffer } from '../../hooks/useDirectOffer';

interface DirectOfferModalProps {
  freelancerId: string;
  freelancerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DirectOfferModal({ freelancerId, freelancerName, onClose, onSuccess }: DirectOfferModalProps) {
  const { user } = useAuth();
  const { sendDirectOffer, loading, error } = useDirectOffer();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const description = formData.get('description')?.toString() || '';
    const hourlyRate = parseFloat(formData.get('hourlyRate')?.toString() || '0');

    const success = await sendDirectOffer({
      freelancerId,
      freelancerName,
      description,
      hourlyRate
    });

    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Direct Offer to {freelancerName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Project Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Describe the project and your requirements..."
            />
          </div>

          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}