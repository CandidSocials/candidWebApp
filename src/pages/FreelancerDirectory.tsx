import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Briefcase, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface FreelancerProfile {
  user_id: string
  full_name: string
  bio: string
  location: string
  skills: string[]
  average_rating: number
  total_reviews: number
  hourly_rate: number
  availability_status: 'available' | 'busy' | 'unavailable'
}

export function FreelancerDirectory() {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minRate: '',
    maxRate: '',
    location: '',
    availability: ''
  })
  const [availableSkills, setAvailableSkills] = useState<string[]>([])

  useEffect(() => {
    fetchFreelancers()
    fetchAvailableSkills()
  }, [])

  async function fetchFreelancers() {
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
          hourly_rate,
          availability_status
        `)
        .eq('role', 'freelancer')
        .order('average_rating', { ascending: false })

      if (error) throw error
      setFreelancers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading freelancers')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailableSkills() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('skills')
        .eq('role', 'freelancer')

      if (error) throw error
      
      const skills = new Set<string>()
      data?.forEach(profile => {
        profile.skills?.forEach(skill => skills.add(skill))
      })
      
      setAvailableSkills(Array.from(skills))
    } catch (err) {
      console.error('Error loading skills:', err)
    }
  }

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = !filters.search || 
      freelancer.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      freelancer.bio?.toLowerCase().includes(filters.search.toLowerCase()) ||
      freelancer.skills?.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))

    const matchesCategory = !filters.category || freelancer.skills?.includes(filters.category)
    
    const matchesRate = (!filters.minRate || freelancer.hourly_rate >= Number(filters.minRate)) &&
      (!filters.maxRate || freelancer.hourly_rate <= Number(filters.maxRate))

    const matchesLocation = !filters.location || 
      freelancer.location.toLowerCase().includes(filters.location.toLowerCase())

    const matchesAvailability = !filters.availability || 
      freelancer.availability_status === filters.availability

    return matchesSearch && matchesCategory && matchesRate && matchesLocation && matchesAvailability
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Freelancers</h1>
        
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or bio..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">All Categories</option>
                {availableSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Rate Range Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rate
                </label>
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.minRate}
                  onChange={(e) => handleFilterChange('minRate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rate
                </label>
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxRate}
                  onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">All Availabilities</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-600">
          Showing {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Freelancers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <div key={freelancer.user_id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {freelancer.full_name}
                  </h2>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-gray-900">{freelancer.average_rating.toFixed(1)}</span>
                      <span className="ml-1 text-gray-500">({freelancer.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  freelancer.availability_status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : freelancer.availability_status === 'busy'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {freelancer.availability_status}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{freelancer.bio}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {freelancer.location}
                </div>
                <div className="flex items-center text-gray-500">
                  <Briefcase className="h-4 w-4 mr-2" />
                  ${freelancer.hourly_rate}/hour
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills?.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      +{freelancer.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <Link
                to={`/freelancer/${freelancer.user_id}`}
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 