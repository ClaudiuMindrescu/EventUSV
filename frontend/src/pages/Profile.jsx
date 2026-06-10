import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

function formatDepartment(department) {
  if (!department) return 'N/A'
  if (department.short_name && department.name) return `${department.name} (${department.short_name})`
  return department.name || department.short_name || 'N/A'
}

function formatRole(role) {
  return (role || 'STUDENT').toUpperCase()
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-slate-900">{value || 'N/A'}</p>
    </div>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function accountAge(createdAt) {
  if (!createdAt) return 'N/A'
  const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000))
  if (days < 30) return `${days} days`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} months`
  return `${Math.floor(months / 12)} years`
}

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    eventsAttended: 0,
    feedbackGiven: 0,
    accountAge: 'N/A',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id,full_name,email,role,department_id,avatar_url,created_at')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        let departmentData = null
        if (profileData.department_id) {
          const { data, error } = await supabase
            .from('departments')
            .select('id,name,short_name')
            .eq('id', profileData.department_id)
            .single()

          if (error) throw error
          departmentData = data
        }

        setProfile({
          ...profileData,
          email: profileData.email || user.email,
          role: formatRole(profileData.role),
          department: departmentData,
        })

        const [registrationsResult, feedbackResult] = await Promise.all([
          supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'confirmed'),
          supabase
            .from('feedback')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ])

        setStats({
          eventsAttended: registrationsResult.count || 0,
          feedbackGiven: feedbackResult.count || 0,
          accountAge: accountAge(profileData.created_at),
        })
      } catch (profileError) {
        console.error('Error fetching profile:', profileError)
        setError('Profilul nu a putut fi incarcat complet.')
        setProfile(user)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-600">Loading...</div>
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

  const department = profile.department

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Profilul meu</h1>
          <p className="mt-2 text-sm text-slate-400">Informatiile contului si activitatea ta.</p>
        </div>
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full border border-slate-200 object-cover"
          />
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Events Attended" value={stats.eventsAttended} hint="Confirmed registrations" />
        <StatCard label="Feedback Given" value={stats.feedbackGiven} hint="Submitted reviews" />
        <StatCard label="Account Age" value={stats.accountAge} hint="Since profile creation" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField label="Nume complet" value={profile.full_name} />
        <ProfileField label="Email" value={profile.email} />
        <ProfileField label="Rol" value={formatRole(profile.role)} />
        <ProfileField label="Departament" value={formatDepartment(department)} />
      </div>
    </div>
  )
}
