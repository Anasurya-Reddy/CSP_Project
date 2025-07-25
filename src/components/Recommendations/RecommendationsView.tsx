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

const GEMINI_API_KEY = 'AIzaSyALKwF1xqSx4QQJOrPdoujqbSsCCZiGuHY'; // Replace with your Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const RecommendationsView: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const handleGeminiRecommend = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiRecommendation(null);
    try {
      if (!user) throw new Error('User not found');
      // Fetch the latest user profile
      let { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      // If profile does not exist, create it with sensible defaults
      if (!profile) {
        const defaultProfile = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Your Name',
          age: 30,
          gender: 'other',
          dietary_preference: 'vegetarian',
          location: '',
          updated_at: new Date().toISOString(),
        };
        const { data: newProfile, error: upsertError } = await supabase
          .from('user_profiles')
          .upsert(defaultProfile)
          .select()
          .single();
        if (upsertError) throw upsertError;
        profile = newProfile;
      } else {
        // Always update the profile's updated_at field
        await supabase
          .from('user_profiles')
          .upsert({
            ...profile,
            updated_at: new Date().toISOString()
          });
      }
      const prompt = `Given the following user profile, provide personalized nutrition and health recommendations.\nProfile: ${JSON.stringify(profile)}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to fetch Gemini recommendation');
      const data = await res.json();
      setAiRecommendation(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation received.');
    } catch (err: any) {
      setAiError(err.message || 'Error fetching AI recommendation');
    } finally {
      setAiLoading(false);
    }
  };

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
            <div className="flex gap-2 items-center">
              <button
                onClick={handleGeminiRecommend}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transform hover:scale-105 transition-all duration-200"
                disabled={aiLoading}
              >
                {aiLoading ? 'Getting AI Recommendation...' : 'Get AI Recommendations'}
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Profile</span>
              </button>
            </div>
          </div>
        </div>
        {aiError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{aiError}</div>
        )}
        {aiRecommendation && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recommended Foods Box */}
            {(() => {
              let output = aiRecommendation.replace(/Given the following user profile[\s\S]*?recommendations?\.?/i, '').trim();
              output = output.replace(/Profile:.*|Condition details:.*|\{.*\}|\[.*\]/gi, '').trim();
              const lines = output.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
              // Heuristics for recommended and not recommended foods
              const recommended = lines.filter(line =>
                /recommended|eat|include|consume|good|healthy|add|should have|increase/i.test(line) &&
                !/avoid|not recommended|do not|should not|limit|restrict|bad|unhealthy/i.test(line)
              );
              const notRecommended = lines.filter(line =>
                /avoid|not recommended|do not|should not|limit|restrict|bad|unhealthy/i.test(line)
              );
              return <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-800 font-bold mb-2">Recommended Foods</h3>
                  {recommended.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-1">
                      {recommended.map((line, idx) => (
                        <li key={idx} className="text-green-900 font-semibold">{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-700">No recommended foods found.</div>
                  )}
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-bold mb-2">Foods to Avoid</h3>
                  {notRecommended.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-1">
                      {notRecommended.map((line, idx) => (
                        <li key={idx} className="text-red-900 font-semibold">{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-700">No foods to avoid found.</div>
                  )}
                </div>
              </>;
            })()}
          </div>
        )}

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