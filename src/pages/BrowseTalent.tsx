import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TalentListing } from '../lib/types';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BrowseTalent() {
  const [listings, setListings] = useState<TalentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data, error } = await supabase
          .from('talent_listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Talent</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">{listing.title}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {listing.category}
                </span>
              </div>
              <p className="mt-2 text-gray-600 line-clamp-3">{listing.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {listing.location}
                </div>
                <div className="flex items-center text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${listing.hourly_rate}/hour
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {listing.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/freelancer/${listing.user_id}`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}