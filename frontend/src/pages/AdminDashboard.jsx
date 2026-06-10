import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../utils/supabase'

const roleOptions = ['STUDENT', 'PROFESOR', 'ADMIN']
const statusOptions = ['pending', 'approved', 'rejected']

const emptyMessage = {
  type: '',
  text: '',
}

function AdminField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function inputClass() {
  return 'w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-usv-gold focus:ring-2 focus:ring-usv-gold/20'
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([])
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [editingProfileId, setEditingProfileId] = useState('')
  const [editingEventId, setEditingEventId] = useState('')
  const [profileDraft, setProfileDraft] = useState({})
  const [eventDraft, setEventDraft] = useState({})
  const [message, setMessage] = useState(emptyMessage)

  const pendingEvents = useMemo(() => events.filter((event) => event.status === 'pending').length, [events])
  const activeEvents = useMemo(
    () =>
      events.filter((event) => {
        const isApproved = event.status === 'approved'
        const hasFutureDate = event.date_end
          ? new Date(event.date_end) >= new Date()
          : new Date(event.date_start) >= new Date()
        return isApproved && hasFutureDate
      }).length,
    [events]
  )
  const topAttendedCategories = useMemo(() => {
    const eventsById = new Map(events.map((event) => [event.id, event]))
    const counts = registrations.reduce((accumulator, registration) => {
      const category = eventsById.get(registration.event_id)?.category || 'Uncategorized'
      accumulator[category] = (accumulator[category] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
  }, [events, registrations])

  useEffect(() => {
    loadAdminData()
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
  }

  const loadAdminData = async () => {
    setLoading(true)
    setMessage(emptyMessage)

    try {
      const [profilesResult, eventsResult, departmentsResult, registrationsResult] = await Promise.all([
        supabase.from('profiles').select('id,email,full_name,role,department_id,avatar_url,is_organizer'),
        supabase.from('events').select('*').order('date_start', { ascending: false }),
        supabase.from('departments').select('id,name,short_name').order('name', { ascending: true }),
        supabase.from('registrations').select('id,event_id,status').eq('status', 'confirmed'),
      ])

      if (profilesResult.error) throw profilesResult.error
      if (eventsResult.error) throw eventsResult.error
      if (departmentsResult.error) throw departmentsResult.error
      if (registrationsResult.error) throw registrationsResult.error

      setProfiles(profilesResult.data || [])
      setEvents(eventsResult.data || [])
      setDepartments(departmentsResult.data || [])
      setRegistrations(registrationsResult.data || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
      showMessage('error', 'Admin data could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const startProfileEdit = (profile) => {
    setEditingProfileId(profile.id)
    setProfileDraft({
      full_name: profile.full_name || '',
      email: profile.email || '',
      role: (profile.role || 'STUDENT').toUpperCase(),
      department_id: profile.department_id || '',
      avatar_url: profile.avatar_url || '',
      is_organizer: Boolean(profile.is_organizer),
    })
  }

  const updateProfile = async (profileId) => {
    try {
      const payload = {
        full_name: profileDraft.full_name.trim() || null,
        email: profileDraft.email.trim() || null,
        role: profileDraft.role,
        department_id: profileDraft.department_id || null,
        avatar_url: profileDraft.avatar_url.trim() || null,
        is_organizer: Boolean(profileDraft.is_organizer),
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profileId)
        .select('id,email,full_name,role,department_id,avatar_url,is_organizer')
        .single()

      if (error) throw error

      setProfiles((current) => current.map((profile) => (profile.id === profileId ? data : profile)))
      setEditingProfileId('')
      showMessage('success', 'User profile updated.')
    } catch (error) {
      console.error('Error updating profile:', error)
      showMessage('error', 'User profile could not be updated.')
    }
  }

  const startEventEdit = (event) => {
    setEditingEventId(event.id)
    setEventDraft({
      title: event.title || '',
      category: event.category || '',
      status: event.status || 'pending',
      short_description: event.short_description || '',
      full_description: event.full_description || '',
      date_start: event.date_start || '',
      date_end: event.date_end || '',
      image_url: event.image_url || '',
      registration_link: event.registration_link || '',
      qr_code_data: event.qr_code_data || '',
    })
  }

  const updateEvent = async (eventId, updates = eventDraft) => {
    try {
      const payload = {
        title: updates.title,
        category: updates.category,
        status: updates.status,
        short_description: updates.short_description,
        full_description: updates.full_description,
        date_start: updates.date_start,
        date_end: updates.date_end,
        image_url: updates.image_url || null,
        registration_link: updates.registration_link || null,
        qr_code_data: updates.qr_code_data || null,
      }

      const { data, error } = await supabase.from('events').update(payload).eq('id', eventId).select('*').single()

      if (error) throw error

      setEvents((current) => current.map((event) => (event.id === eventId ? data : event)))
      setEditingEventId('')
      showMessage('success', 'Event updated.')
    } catch (error) {
      console.error('Error updating event:', error)
      showMessage('error', 'Event could not be updated.')
    }
  }

  const setEventStatus = async (event, status) => {
    try {
      const { data, error } = await supabase.from('events').update({ status }).eq('id', event.id).select('*').single()
      if (error) throw error

      setEvents((current) => current.map((item) => (item.id === event.id ? data : item)))
      showMessage('success', `Event ${status}.`)
    } catch (error) {
      console.error('Error updating event status:', error)
      showMessage('error', 'Event status could not be updated.')
    }
  }

  const deleteEvent = async (eventId) => {
    const confirmed = window.confirm('Delete this event?')
    if (!confirmed) return

    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error

      setEvents((current) => current.filter((event) => event.id !== eventId))
      showMessage('success', 'Event deleted.')
    } catch (error) {
      console.error('Error deleting event:', error)
      showMessage('error', 'Event could not be deleted.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-7xl text-slate-300">Loading admin dashboard...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-neon">Admin Portal</p>
            <h1 className="mt-2 text-4xl font-bold text-white">EventUSV Control Center</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Manage users, roles, event approvals, event content, and moderation from one dedicated admin surface.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs uppercase text-slate-400">Total Users</p>
            <p className="mt-3 text-3xl font-bold text-white">{profiles.length}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs uppercase text-slate-400">Active Events</p>
            <p className="mt-3 text-3xl font-bold text-white">{activeEvents}</p>
          </div>
          <div className="rounded-lg border border-violet-400/30 bg-violet-500/10 p-5">
            <p className="text-xs uppercase text-violet-200">Pending Approvals</p>
            <p className="mt-3 text-3xl font-bold text-violet-100">{pendingEvents}</p>
          </div>
          <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-5">
            <p className="text-xs uppercase text-cyan-200">Top Attended Categories</p>
            <div className="mt-3 space-y-1">
              {topAttendedCategories.length > 0 ? (
                topAttendedCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="text-white">{category}</span>
                    <span className="text-cyan-200">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No confirmed registrations yet.</p>
              )}
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'border-red-400/40 bg-red-500/10 text-red-200'
                : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6 flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === 'users' ? 'border-b-2 border-usv-gold text-usv-gold' : 'text-slate-400'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === 'events' ? 'border-b-2 border-usv-gold text-usv-gold' : 'text-slate-400'
            }`}
          >
            Event Management
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-4">
            {profiles.map((profile) => {
              const isEditing = editingProfileId === profile.id
              const department = departments.find((item) => item.id === profile.department_id)

              return (
                <section key={profile.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-start">
                    <div>
                      <p className="font-semibold text-white">{profile.full_name || 'Unnamed user'}</p>
                      <p className="text-sm text-slate-400">{profile.email}</p>
                      <p className="mt-2 text-xs uppercase text-slate-500">{profile.id}</p>
                    </div>

                    {isEditing ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <AdminField label="Full Name">
                          <input
                            className={inputClass()}
                            value={profileDraft.full_name}
                            onChange={(event) => setProfileDraft({ ...profileDraft, full_name: event.target.value })}
                          />
                        </AdminField>
                        <AdminField label="Email">
                          <input
                            className={inputClass()}
                            value={profileDraft.email}
                            onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })}
                          />
                        </AdminField>
                        <AdminField label="Role">
                          <select
                            className={inputClass()}
                            value={profileDraft.role}
                            onChange={(event) => setProfileDraft({ ...profileDraft, role: event.target.value })}
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </AdminField>
                        <AdminField label="Department">
                          <select
                            className={inputClass()}
                            value={profileDraft.department_id}
                            onChange={(event) => setProfileDraft({ ...profileDraft, department_id: event.target.value })}
                          >
                            <option value="">No department</option>
                            {departments.map((departmentOption) => (
                              <option key={departmentOption.id} value={departmentOption.id}>
                                {departmentOption.short_name || departmentOption.name}
                              </option>
                            ))}
                          </select>
                        </AdminField>
                        <AdminField label="Avatar URL">
                          <input
                            className={inputClass()}
                            value={profileDraft.avatar_url}
                            onChange={(event) => setProfileDraft({ ...profileDraft, avatar_url: event.target.value })}
                          />
                        </AdminField>
                        <label className="flex items-center gap-2 self-end text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={profileDraft.is_organizer}
                            onChange={(event) =>
                              setProfileDraft({ ...profileDraft, is_organizer: event.target.checked })
                            }
                          />
                          Organizer
                        </label>
                      </div>
                    ) : (
                      <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                        <p>
                          <span className="text-slate-500">Role:</span> {(profile.role || 'STUDENT').toUpperCase()}
                        </p>
                        <p>
                          <span className="text-slate-500">Department:</span>{' '}
                          {department?.short_name || department?.name || 'None'}
                        </p>
                        <p>
                          <span className="text-slate-500">Organizer:</span> {profile.is_organizer ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 lg:justify-end">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => updateProfile(profile.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-usv-gold px-3 py-2 text-sm font-semibold text-slate-950"
                          >
                            <Save className="h-4 w-4" /> Save
                          </button>
                          <button
                            onClick={() => setEditingProfileId('')}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200"
                          >
                            <X className="h-4 w-4" /> Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startProfileEdit(profile)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-usv-gold hover:text-usv-gold"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isEditing = editingEventId === event.id

              return (
                <section key={event.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-white">{event.title}</h2>
                        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs uppercase text-slate-300">
                          {event.status || 'pending'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{event.date_start}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEventStatus(event, 'approved')}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25"
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => setEventStatus(event, 'rejected')}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/25"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => (isEditing ? setEditingEventId('') : startEventEdit(event))}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-usv-gold hover:text-usv-gold"
                      >
                        <Pencil className="h-4 w-4" /> {isEditing ? 'Close' : 'Edit'}
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminField label="Title">
                        <input
                          className={inputClass()}
                          value={eventDraft.title}
                          onChange={(changeEvent) => setEventDraft({ ...eventDraft, title: changeEvent.target.value })}
                        />
                      </AdminField>
                      <AdminField label="Category">
                        <input
                          className={inputClass()}
                          value={eventDraft.category}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, category: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Status">
                        <select
                          className={inputClass()}
                          value={eventDraft.status}
                          onChange={(changeEvent) => setEventDraft({ ...eventDraft, status: changeEvent.target.value })}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </AdminField>
                      <AdminField label="Starts At">
                        <input
                          className={inputClass()}
                          value={eventDraft.date_start}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, date_start: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Ends At">
                        <input
                          className={inputClass()}
                          value={eventDraft.date_end}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, date_end: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Image URL">
                        <input
                          className={inputClass()}
                          value={eventDraft.image_url}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, image_url: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Short Description">
                        <textarea
                          className={inputClass()}
                          value={eventDraft.short_description}
                          rows={3}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, short_description: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Full Description">
                        <textarea
                          className={inputClass()}
                          value={eventDraft.full_description}
                          rows={3}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, full_description: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Registration Link">
                        <input
                          className={inputClass()}
                          value={eventDraft.registration_link}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, registration_link: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="QR Code Data">
                        <input
                          className={inputClass()}
                          value={eventDraft.qr_code_data}
                          onChange={(changeEvent) =>
                            setEventDraft({ ...eventDraft, qr_code_data: changeEvent.target.value })
                          }
                        />
                      </AdminField>
                      <div className="md:col-span-2">
                        <button
                          onClick={() => updateEvent(event.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-usv-gold px-4 py-2 text-sm font-semibold text-slate-950"
                        >
                          <Save className="h-4 w-4" /> Save Event
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300">{event.short_description || 'No description.'}</p>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
