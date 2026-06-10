import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

function normalizeProfile(data, fallbackUser) {
  return {
    id: data?.id || fallbackUser?.id,
    email: data?.email || fallbackUser?.email || '',
    full_name: data?.full_name || '',
    role: (data?.role || fallbackUser?.role || 'STUDENT').toUpperCase(),
    department_id: data?.department_id || '',
    avatar_url: data?.avatar_url || '',
    department: data?.department || fallbackUser?.department || null,
  }
}

function departmentLabel(department) {
  if (!department) return 'Departament fara nume'
  if (department.short_name && department.name) return `${department.short_name} - ${department.name}`
  return department.name || department.short_name || 'Departament fara nume'
}

export default function Settings({ user, onProfileUpdated }) {
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    department_id: '',
    avatar_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [profileResult, departmentsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id,email,full_name,role,department_id,avatar_url')
            .eq('id', user.id)
            .single(),
          supabase
            .from('departments')
            .select('id,name,short_name')
            .order('name', { ascending: true }),
        ])

        if (profileResult.error) throw profileResult.error
        if (departmentsResult.error) throw departmentsResult.error

        const departmentRows = departmentsResult.data || []
        const profile = normalizeProfile(
          {
            ...profileResult.data,
            department: departmentRows.find((department) => department.id === profileResult.data?.department_id) || null,
          },
          user
        )
        setDepartments(departmentRows)
        setForm({
          full_name: profile.full_name,
          department_id: profile.department_id || '',
          avatar_url: profile.avatar_url,
        })
        onProfileUpdated(profile)
      } catch (loadError) {
        console.error('Error loading settings:', loadError)
        setError('Setarile profilului nu au putut fi incarcate.')
        setForm({
          full_name: user.full_name || '',
          department_id: user.department_id || '',
          avatar_url: user.avatar_url || '',
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user?.id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        full_name: form.full_name.trim() || null,
        department_id: form.department_id || null,
        avatar_url: form.avatar_url.trim() || null,
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
        .select('id,email,full_name,role,department_id,avatar_url')
        .single()

      if (error) throw error

      const profile = normalizeProfile(
        {
          ...data,
          department: departments.find((department) => department.id === data.department_id) || null,
        },
        user
      )
      onProfileUpdated(profile)
      setForm({
        full_name: profile.full_name,
        department_id: profile.department_id || '',
        avatar_url: profile.avatar_url,
      })
      setMessage('Profilul a fost actualizat.')
    } catch (saveError) {
      console.error('Error updating profile:', saveError)
      setError('Modificarile nu au putut fi salvate.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Setari</h1>
        <p className="mt-2 text-sm text-slate-600">Actualizeaza detaliile profilului tau.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <label htmlFor="full_name" className="mb-2 block text-sm font-semibold text-slate-700">
              Nume complet
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-usv-blue"
              placeholder="Numele tau"
            />
          </div>

          <div>
            <label htmlFor="department_id" className="mb-2 block text-sm font-semibold text-slate-700">
              Departament
            </label>
            <select
              id="department_id"
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-usv-blue"
            >
              <option value="">Fara departament</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {departmentLabel(department)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="avatar_url" className="mb-2 block text-sm font-semibold text-slate-700">
              Avatar URL
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              value={form.avatar_url}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-usv-blue"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-usv-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Se salveaza...' : 'Salveaza modificarile'}
          </button>
        </div>
      </form>
    </div>
  )
}
