import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Heart, Clock, TrendingUp, Edit, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface UserProfile {
  id: string
  full_name: string
  age: number
  gender: string
  dietary_preference: string
  location: string | null
  created_at: string
}

interface RecommendationHistory {
  id: string
  created_at: string
  recommended_foods: string[]
  foods_to_avoid: string[]
  supplements: string[]
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        setProfile(profileData)

        // Fetch recommendations history
        const { data: recData, error: recError } = await supabase
          .from('recommendations')
          .select('id, created_at, recommended_foods, foods_to_avoid, supplements')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (recError && recError.code !== 'PGRST116') {
          throw recError
        }

        setRecommendations(recData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your health journey and get personalized nutrition recommendations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Update Profile</h3>
                <p className="text-green-100 text-sm">Modify your health information</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/recommendations')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Recommendations</h3>
                <p className="text-blue-100 text-sm">See your latest nutrition advice</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">New Assessment</h3>
                <p className="text-purple-100 text-sm">Get fresh recommendations</p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="w-6 h-6" />
                <span>Profile Summary</span>
              </h2>
            </div>
            <div className="p-6">
              {profile ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{profile.age} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium capitalize">{profile.gender}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Diet:</span>
                    <span className="font-medium capitalize">{profile.dietary_preference}</span>
                  </div>
                  {profile.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{profile.location}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No profile information yet</p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations History */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" />
                <span>Recent Recommendations</span>
              </h2>
            </div>
            <div className="p-6">
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(rec.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/recommendations')}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{rec.recommended_foods.length}</p>
                          <p className="text-xs text-gray-600">Recommended</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{rec.foods_to_avoid.length}</p>
                          <p className="text-xs text-gray-600">To Avoid</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{rec.supplements.length}</p>
                          <p className="text-xs text-gray-600">Supplements</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No recommendations yet</p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Health Tips for Rural India</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🥬</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Eat Local Greens</h3>
                <p className="text-gray-600 text-sm">Include seasonal leafy vegetables like spinach, fenugreek, and amaranth in your daily diet.</p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💧</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Stay Hydrated</h3>
                <p className="text-gray-600 text-sm">Drink clean, boiled water regularly. Add lemon or mint for better taste and nutrition.</p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🌾</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Whole Grains</h3>
                <p className="text-gray-600 text-sm">Opt for brown rice, whole wheat, and millets instead of refined grains for better nutrition.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard