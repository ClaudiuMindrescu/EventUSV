import { useEffect, useState } from 'react'
import { CalendarPlus, CheckCircle2, Download, X } from 'lucide-react'
import { supabase } from '../utils/supabase'

const toCalendarDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

const escapeIcsText = (value = '') =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')

const getEventEndDate = (event) => {
  if (event?.date_end) return event.date_end

  const startDate = new Date(event?.date_start)
  if (Number.isNaN(startDate.getTime())) return event?.date_start

  return new Date(startDate.getTime() + 60 * 60 * 1000).toISOString()
}

const getEventPlace = (event, locationName) => event?.online_link || locationName || ''

const getGoogleCalendarUrl = (event, locationName) => {
  const start = toCalendarDate(event.date_start)
  const end = toCalendarDate(getEventEndDate(event))
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Event',
    dates: `${start}/${end}`,
    details: event.short_description || '',
    location: getEventPlace(event, locationName),
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const downloadIcsFile = (event, locationName) => {
  const start = toCalendarDate(event.date_start)
  const end = toCalendarDate(getEventEndDate(event))
  const now = toCalendarDate(new Date())
  const title = event.title || 'Event'
  const location = getEventPlace(event, locationName)
  const uid = `${event.id || crypto.randomUUID()}@eventusv`
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event'}.ics`
  const description = [event.short_description, event.online_link].filter(Boolean).join('\n')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventUSV//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function EventDetails({ eventId, token, user, onBack }) {
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState('')
  const hasRegistration = Boolean(registrationStatus)

  useEffect(() => {
    async function fetchEvent() {
      if (!token) {
        setError('Trebuie să fii autentificat pentru a vedea detaliile evenimentului.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:8000/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          const message = body.detail || 'Unable to load event details.'
          throw new Error(message)
        }

        const data = await response.json()
        setEvent(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, token])

  useEffect(() => {
    async function fetchRegistrationStatus() {
      if (!user?.id || !eventId) return

      setRegistrationStatus('')
      setRegistrationMessage('')

      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('id,status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .limit(1)

        if (error) throw error

        const existingRegistration = data?.[0]
        if (existingRegistration) {
          setRegistrationStatus(existingRegistration.status || 'registered')
          setRegistrationMessage(
            existingRegistration.status === 'confirmed'
              ? 'Participarea ta este confirmata.'
              : 'Exista deja o inregistrare pentru acest eveniment.'
          )
        }
      } catch (err) {
        console.error('Error checking registration:', err)
      }
    }

    fetchRegistrationStatus()
  }, [eventId, user?.id])

  const handleConfirmParticipation = async () => {
    if (!user?.id) {
      setRegistrationMessage('Trebuie sa fii autentificat pentru confirmare.')
      return
    }

    setRegistrationLoading(true)
    setRegistrationMessage('')

    try {
      const { error } = await supabase.from('registrations').insert({
        event_id: eventId,
        user_id: user.id,
        status: 'confirmed',
      })

      if (error) {
        if (error.code === '23505') {
          setRegistrationStatus('confirmed')
          setRegistrationMessage('Participarea ta este deja confirmata.')
          return
        }
        throw error
      }

      setRegistrationStatus('confirmed')
      setRegistrationMessage('Participarea a fost confirmata.')
    } catch (err) {
      console.error('Error confirming participation:', err)
      setRegistrationMessage('Participarea nu a putut fi confirmata.')
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleCancelParticipation = async () => {
    if (!user?.id) {
      setRegistrationMessage('Trebuie sa fii autentificat pentru anulare.')
      return
    }

    if (!window.confirm('Esti sigur ca vrei sa anulezi participarea?')) {
      return
    }

    setRegistrationLoading(true)
    setRegistrationMessage('')

    try {
      const response = await fetch(`http://localhost:8000/participation/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const message = body.detail || 'Unable to cancel participation.'
        throw new Error(message)
      }

      setRegistrationStatus('')
      setRegistrationMessage('Participarea a fost anulata cu succes.')
    } catch (err) {
      console.error('Error cancelling participation:', err)
      setRegistrationMessage('Participarea nu a putut fi anulata.')
    } finally {
      setRegistrationLoading(false)
    }
  }

  const locationName =
    event?.location?.name || event?.locations?.name || event?.location_name || 'Unknown location'

  const handleAddToGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event, locationName), '_blank', 'noopener,noreferrer')
  }

  const handleDownloadIcs = () => {
    downloadIcsFile(event, locationName)
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading event details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-red-700">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-full bg-usv-blue px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">{event.title}</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-usv-blue">{event.category}</p>
        </div>
        <button
          onClick={onBack}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Back
        </button>
      </div>

      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="mb-6 h-72 w-full rounded-3xl object-cover" />
      )}

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Participare</p>
          <p className="mt-1 text-sm text-slate-600">
            {registrationMessage || 'Confirma participarea la acest eveniment.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleConfirmParticipation}
            disabled={registrationLoading || hasRegistration}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-usv-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-default disabled:bg-emerald-600 disabled:opacity-80"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {hasRegistration
              ? registrationStatus === 'confirmed'
                ? 'Participare confirmata'
                : 'Deja inregistrat'
              : registrationLoading
                ? 'Se confirma...'
                : 'Confirm Participation'}
          </button>
          {hasRegistration && (
            <button
              onClick={handleCancelParticipation}
              disabled={registrationLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-default disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {registrationLoading ? 'Se anuleaza...' : 'Anuleaza Participarea'}
            </button>
          )}
          <button
            type="button"
            onClick={handleAddToGoogleCalendar}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Add to Google Calendar
          </button>
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download .ics
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600 mb-6">
        <div>
          <p className="font-semibold text-slate-900">Location</p>
          <p>{locationName}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Start</p>
          <p>{event.date_start}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">End</p>
          <p>{event.date_end}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Status</p>
          <p>{event.status}</p>
        </div>
      </div>

      <div className="space-y-4 text-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Short Description</h3>
          <p className="mt-2">{event.short_description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Full Description</h3>
          <p className="mt-2 whitespace-pre-line">{event.full_description}</p>
        </div>
        {event.registration_link && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Registration</h3>
            <a href={event.registration_link} target="_blank" rel="noreferrer" className="text-usv-blue hover:text-blue-700">
              {event.registration_link}
            </a>
          </div>
        )}
        {event.qr_code_data && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">QR Code Data</h3>
            <p className="break-words">{event.qr_code_data}</p>
          </div>
        )}
      </div>
    </article>
  )
}
