import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

function ProfileDropdown({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      onLogout()
      setDropdownOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
      onLogout()
      setDropdownOpen(false)
      navigate('/')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 hover:bg-slate-100 transition-colors"
      >
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-900">{user.full_name || user.email}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-usv-blue">{user.role}</div>
        </div>
        <svg
          className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="font-semibold text-slate-900">{user.full_name || 'User'}</p>
            <p className="text-xs text-slate-600">{user.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-usv-blue hover:text-white transition-colors"
          >
            Profilul meu
          </Link>
          <Link
            to="/my-events"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-usv-blue hover:text-white transition-colors"
          >
            Evenimentele mele
          </Link>
          <Link
            to="/settings"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-usv-blue hover:text-white transition-colors"
          >
            Setări
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-usv-blue hover:text-blue-700 transition-colors">
          EventUSV
        </Link>

        {/* Right: Navigation */}
        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/evenimente" className="hover:text-usv-blue transition-colors">
            Evenimente
          </Link>

          {user ? (
            <ProfileDropdown user={user} onLogout={onLogout} />
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-usv-blue px-6 py-2 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Conectare
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
