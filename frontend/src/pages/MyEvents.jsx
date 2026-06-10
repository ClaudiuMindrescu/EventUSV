import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import FeedbackForm from '../components/FeedbackForm'
import { supabase } from '../utils/supabase'

export default function MyEvents({ token, user }) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackEvent, setFeedbackEvent] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (token && user?.id) {
      fetchRegistrations()
    } else {
      setLoading(false)
    }
  }, [token, user?.id])

  const fetchRegistrations = async () => {
    setLoading(true)

    try {
      const { data: registrationRows, error: registrationError } = await supabase
        .from('registrations')
        .select('id,event_id,user_id,status')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')

      if (registrationError) throw registrationError

      const uniqueRegistrations = Array.from(
        new Map((registrationRows || []).map((registration) => [registration.event_id, registration])).values()
      ).filter((registration) => registration.event_id)
      const eventIds = uniqueRegistrations.map((registration) => registration.event_id)

      if (eventIds.length === 0) {
        setRegistrations([])
        return
      }

      const { data: eventRows, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)

      if (eventsError) throw eventsError

      const eventsById = new Map((eventRows || []).map((event) => [event.id, event]))
      const confirmedRegistrations = uniqueRegistrations
        .map((registration) => ({
          ...registration,
          event: eventsById.get(registration.event_id),
        }))
        .filter((registration) => registration.event)

      setRegistrations(confirmedRegistrations)
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const upcomingEvents = registrations.filter((registration) => new Date(registration.event.date_start) > now)
  const pastEvents = registrations.filter(
    (registration) => new Date(registration.event.date_end || registration.event.date_start) < now
  )
  const visibleRegistrations = activeTab === 'upcoming' ? upcomingEvents : pastEvents

  const handleFeedback = (event) => {
    setFeedbackEvent(event)
  }

  const closeFeedback = () => {
    setFeedbackEvent(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Evenimentele mele</h1>

      <div className="mb-8 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'border-b-2 border-usv-blue text-usv-blue'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Viitoare ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'past'
              ? 'border-b-2 border-usv-blue text-usv-blue'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Istoric ({pastEvents.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleRegistrations.map((registration) => (
          <div key={registration.id} className="relative">
            <EventCard
              event={registration.event}
              onViewDetails={(eventId) => navigate(`/evenimente/${eventId}`)}
            />
            {activeTab === 'past' && (
              <button
                onClick={() => handleFeedback(registration.event)}
                className="absolute right-2 top-2 rounded-full bg-usv-blue px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Lasa Feedback
              </button>
            )}
          </div>
        ))}
      </div>

      {visibleRegistrations.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-slate-600">
            {activeTab === 'upcoming'
              ? 'Nu ai evenimente viitoare confirmate.'
              : 'Nu ai evenimente confirmate in istoric.'}
          </p>
        </div>
      )}

      {feedbackEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold">Feedback pentru {feedbackEvent.title}</h2>
              <FeedbackForm eventId={feedbackEvent.id} token={token} onClose={closeFeedback} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
