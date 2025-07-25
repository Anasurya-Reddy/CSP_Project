import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Pill, AlertTriangle, RefreshCw, User, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Recommendation {
  id: string
  recommended_foods: string[]
  foods_to_avoid: string[]
  supplements: string[]
  explanations: Record<string, string>
  warnings: string[]
  created_at: string
}

const RecommendationsView: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setRecommendations(data)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your recommendations...</p>
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Yet</h2>
          <p className="text-gray-600 mb-6">Complete your health profile to get personalized nutrition recommendations.</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
          >
            Complete Health Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Nutrition Recommendations</h1>
              <p className="text-gray-600 mt-2 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Generated on {new Date(recommendations.created_at).toLocaleDateString()}</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommended Foods */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <CheckCircle className="w-6 h-6" />
                <span>Recommended Foods</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recommendations.recommended_foods.map((food, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{food}</p>
                      {recommendations.explanations[food.toLowerCase()] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendations.explanations[food.toLowerCase()]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Foods to Avoid */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <XCircle className="w-6 h-6" />
                <span>Foods to Avoid</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recommendations.foods_to_avoid.map((food, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{food}</p>
                      {recommendations.explanations[food.toLowerCase()] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendations.explanations[food.toLowerCase()]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Supplements */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Pill className="w-6 h-6" />
                <span>Recommended Supplements</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recommendations.supplements.map((supplement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <Pill className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{supplement}</p>
                      {recommendations.explanations[supplement.toLowerCase()] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendations.explanations[supplement.toLowerCase()]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {recommendations.warnings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Important Warnings</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendations.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Medical Disclaimer</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                This information is for educational purposes only and should not replace professional medical advice. 
                Always consult with your healthcare provider before making significant changes to your diet or taking 
                new supplements, especially if you have medical conditions or take medications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationsView