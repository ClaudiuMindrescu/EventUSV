import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, LayoutDashboard, LogOut, Settings, User } from 'lucide-react'
import { supabase } from '../utils/supabase'

const roleStyles = {
  STUDENT: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PROFESOR: 'border-blue-200 bg-blue-50 text-blue-700',
  ADMIN: 'border-amber-200 bg-amber-50 text-amber-700',
}

function getRole(user) {
  return (user?.role || 'STUDENT').toUpperCase()
}

function getInitials(user) {
  return (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function RoleBadge({ role, className = '' }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase leading-none ${
        roleStyles[role] || roleStyles.STUDENT
      } ${className}`}
    >
      {role}
    </span>
  )
}

function ProfileDropdown({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const role = getRole(user)
  const initials = getInitials(user)
  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    if (!dropdownOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      onLogout()
      setDropdownOpen(false)
      navigate('/')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-usv-blue text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <div className="max-w-36 truncate text-xs font-semibold text-slate-900">{user.full_name || user.email}</div>
          <RoleBadge role={role} className="mt-1 px-2 py-0.5 text-[10px]" />
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-usv-blue text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{user.full_name || 'User'}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <RoleBadge role={role} className="mt-2" />
              </div>
            </div>
          </div>

          <div className="p-2">
            {isAdmin ? (
              <Link
                to="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Admin Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <User className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  Profilul meu
                </Link>
                <Link
                  to="/calendar"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  Calendar
                </Link>
                <Link
                  to="/my-events"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  Evenimentele mele
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <Settings className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  Setari
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-2xl font-bold text-usv-gold transition-colors hover:text-yellow-300">
          EventUSV
        </Link>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
          <Link to={user?.role === 'ADMIN' ? '/admin' : '/evenimente'} className="transition-colors hover:text-usv-gold">
            {user?.role === 'ADMIN' ? 'Admin' : 'Evenimente'}
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
