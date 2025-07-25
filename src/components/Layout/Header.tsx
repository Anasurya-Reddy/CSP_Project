import React from 'react'
import { User, LogOut, Heart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NutriCare</h1>
              <p className="text-xs text-gray-500">Rural India Health</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium border border-green-200"
              >
                Home
              </Link>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header