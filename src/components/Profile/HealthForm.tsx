import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Calendar, Users, Utensils, Heart, Pill, AlertTriangle, MapPin, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface HealthFormData {
  fullName: string
  age: string
  gender: string
  dietaryPreference: string
  healthConditions: string[]
  medications: string
  allergies: string
  location: string
  foodTypes: string[]
  waterConsumption: string
}

const HealthForm: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<HealthFormData>({
    fullName: user?.user_metadata?.full_name || '',
    age: '',
    gender: '',
    dietaryPreference: '',
    healthConditions: [],
    medications: '',
    allergies: '',
    location: '',
    foodTypes: [],
    waterConsumption: ''
  })

  const healthConditionsList = [
    'Diabetes', 'High Blood Pressure', 'High Cholesterol', 'Heart Disease',
    'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'Anemia',
    'Arthritis', 'Osteoporosis', 'Digestive Issues', 'Other'
  ]

  const handleConditionChange = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }))
  }

  const generateRecommendations = (data: HealthFormData) => {
    const recommendations = {
      recommended_foods: [] as string[],
      foods_to_avoid: [] as string[],
      supplements: [] as string[],
      explanations: {} as Record<string, string>,
      warnings: [] as string[]
    }

    // Base recommendations for rural India
    recommendations.recommended_foods.push(
      'Green leafy vegetables (Spinach, Fenugreek leaves)',
      'Lentils (Dal - Moong, Masoor, Chana)',
      'Seasonal fruits (Banana, Papaya, Guava)',
      'Whole grains (Brown rice, Wheat, Millets)',
      'Nuts and seeds (Groundnuts, Sesame seeds)'
    )

    // Age-based recommendations
    const age = parseInt(data.age)
    if (age > 50) {
      recommendations.supplements.push('Calcium', 'Vitamin D', 'Vitamin B12')
      recommendations.recommended_foods.push('Milk and dairy products', 'Fish (if non-vegetarian)')
      recommendations.explanations['calcium'] = 'Essential for bone health in older adults'
    }

    // Gender-based recommendations
    if (data.gender === 'female') {
      recommendations.supplements.push('Iron', 'Folic Acid')
      recommendations.recommended_foods.push('Iron-rich foods (Jaggery, Dates)')
      recommendations.explanations['iron'] = 'Important for women to prevent anemia'
    }

    // Health condition-based recommendations
    data.healthConditions.forEach(condition => {
      switch (condition.toLowerCase()) {
        case 'diabetes':
          recommendations.recommended_foods.push('Bitter gourd', 'Fenugreek seeds', 'Cinnamon')
          recommendations.foods_to_avoid.push('White rice', 'Sugar', 'Refined flour')
          recommendations.explanations['diabetes'] = 'These foods help control blood sugar levels'
          break
        case 'high blood pressure':
          recommendations.recommended_foods.push('Garlic', 'Onions', 'Low-sodium foods')
          recommendations.foods_to_avoid.push('Salt', 'Pickles', 'Processed foods')
          recommendations.explanations['bp'] = 'Low sodium diet helps manage blood pressure'
          break
        case 'high cholesterol':
          recommendations.recommended_foods.push('Oats', 'Barley', 'Flax seeds')
          recommendations.foods_to_avoid.push('Fried foods', 'Ghee', 'Butter')
          recommendations.explanations['cholesterol'] = 'Fiber-rich foods help reduce cholesterol'
          break
        case 'anemia':
          recommendations.recommended_foods.push('Spinach', 'Pomegranate', 'Beetroot')
          recommendations.supplements.push('Iron')
          recommendations.explanations['anemia'] = 'Iron-rich foods help increase hemoglobin'
          break
      }
    })

    // Dietary preference adjustments
    if (data.dietaryPreference === 'vegetarian' || data.dietaryPreference === 'vegan') {
      recommendations.recommended_foods.push('Protein-rich legumes', 'Quinoa', 'Tofu')
      if (data.dietaryPreference === 'vegan') {
        recommendations.supplements.push('Vitamin B12')
        recommendations.explanations['b12'] = 'Vegans need B12 supplementation'
      }
    }

    // Medication warnings
    if (data.medications.toLowerCase().includes('warfarin')) {
      recommendations.warnings.push('Limit green leafy vegetables if taking blood thinners')
    }

    // Allergy considerations
    if (data.allergies) {
      recommendations.warnings.push(`Avoid foods you are allergic to: ${data.allergies}`)
    }

    return recommendations
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Save user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          gender: formData.gender,
          dietary_preference: formData.dietaryPreference,
          location: formData.location,
          updated_at: new Date().toISOString(),
          food_types: formData.foodTypes,
          water_consumption: formData.waterConsumption
        })

      if (profileError) throw profileError

      // Save health conditions
      const { error: healthError } = await supabase
        .from('health_conditions')
        .upsert({
          user_id: user.id,
          condition_name: formData.healthConditions.join(', '),
          medications: formData.medications,
          allergies: formData.allergies
        })

      if (healthError) throw healthError

      // Generate and save recommendations (optional, can be removed if only using AI)
      // const recommendations = generateRecommendations(formData)
      // const { error: recError } = await supabase
      //   .from('recommendations')
      //   .insert({
      //     user_id: user.id,
      //     ...recommendations
      //   })
      // if (recError) throw recError

      // Redirect to recommendations page, which will now auto-trigger AI recommendation
      navigate('/recommendations?autoAI=1')
    } catch (error) {
      console.error('Error saving data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Health Profile</h2>
            <p className="text-green-100 mt-2">Tell us about your health so we can provide personalized recommendations</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Utensils className="w-4 h-4 inline mr-1" />
                    Dietary Preference
                  </label>
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData(prev => ({ ...prev, dietaryPreference: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City, State"
                />
              </div>
            </div>
            
            {/* Food Types and Water Consumption */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-green-500" />
                <span>Dietary Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type of Food Consumed</label>
                  <div className="flex flex-wrap gap-2">
                    {['Fruits', 'Vegetables', 'Grains', 'Protein', 'Dairy'].map(type => (
                      <label key={type} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          value={type}
                          checked={formData.foodTypes.includes(type)}
                          onChange={e => {
                            if (e.target.checked) setFormData(prev => ({ ...prev, foodTypes: [...prev.foodTypes, type] }))
                            else setFormData(prev => ({ ...prev, foodTypes: prev.foodTypes.filter(t => t !== type) }))
                          }}
                          className="form-checkbox text-green-600"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Water Consumption</label>
                  <select
                    className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={formData.waterConsumption}
                    onChange={e => setFormData(prev => ({ ...prev, waterConsumption: e.target.value }))}
                  >
                    <option value="">Select</option>
                    <option value="1-3 liters">1-3 liters</option>
                    <option value="Above 3 liters">Above 3 liters</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Health Conditions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Health Conditions</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {healthConditionsList.map((condition) => (
                  <label key={condition} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.healthConditions.includes(condition)}
                      onChange={() => handleConditionChange(condition)}
                      className="text-green-500 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Medications and Allergies */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Pill className="w-5 h-5 text-purple-500" />
                <span>Medications & Allergies</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications (Optional)
                  </label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="List any medications you are currently taking..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Food Allergies (Optional)
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="List any food allergies or intolerances..."
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Get My Recommendations</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HealthForm