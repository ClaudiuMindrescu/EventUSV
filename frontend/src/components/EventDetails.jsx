import { useEffect, useState } from 'react'

export default function EventDetails({ eventId, token, onBack }) {
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const locationName =
    event?.location?.name || event?.locations?.name || event?.location_name || 'Unknown location'

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
