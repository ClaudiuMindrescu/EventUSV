import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import FeedbackForm from '../components/FeedbackForm'

export default function MyEvents({ token, user }) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackEvent, setFeedbackEvent] = useState(null)

  useEffect(() => {
    if (token) {
      fetchRegistrations()
    }
  }, [token])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/participation/my-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch registrations')
      const data = await response.json()
      setRegistrations(data.data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const upcomingEvents = registrations.filter(reg => new Date(reg.event.date_start) > now)
  const pastEvents = registrations.filter(reg => new Date(reg.event.date_end) < now)

  const handleFeedback = (event) => {
    setFeedbackEvent(event)
  }

  const closeFeedback = () => {
    setFeedbackEvent(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Evenimentele mele</h1>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'upcoming' ? upcomingEvents : pastEvents).map((registration) => (
          <div key={registration.id} className="relative">
            <EventCard
              event={registration.event}
              onViewDetails={() => {}} // Could implement event details modal
            />
            {activeTab === 'past' && (
              <button
                onClick={() => handleFeedback(registration.event)}
                className="absolute top-2 right-2 bg-usv-blue text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Lasă Feedback
              </button>
            )}
          </div>
        ))}
      </div>

      {((activeTab === 'upcoming' && upcomingEvents.length === 0) ||
        (activeTab === 'past' && pastEvents.length === 0)) && (
        <div className="text-center py-12">
          <p className="text-slate-600">
            {activeTab === 'upcoming'
              ? 'Nu ai evenimente viitoare înregistrate.'
              : 'Nu ai evenimente în istoric.'}
          </p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Feedback pentru {feedbackEvent.title}</h2>
              <FeedbackForm eventId={feedbackEvent.id} token={token} onClose={closeFeedback} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}