import { useState, useEffect } from 'react'

export default function Profile({ token, user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token && user) {
      fetchProfile()
    }
  }, [token, user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to user data from auth
      setProfile(user)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-600">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Profilul meu</h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nume complet</label>
            <p className="text-lg font-semibold text-slate-900">{profile.full_name || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <p className="text-lg text-slate-900">{profile.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Rol</label>
            <p className="text-lg text-slate-900 capitalize">{profile.role || 'Student'}</p>
          </div>

          {profile.department && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Departament/Facultate</label>
              <p className="text-lg text-slate-900">{profile.department}</p>
            </div>
          )}

          {profile.faculty && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Facultate</label>
              <p className="text-lg text-slate-900">{profile.faculty}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}