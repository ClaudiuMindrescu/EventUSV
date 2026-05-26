import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventList from '../components/EventList'
import AddEvent from '../components/AddEvent'

export default function EventsPage({ token, user }) {
  const [events, setEvents] = useState([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPublicEvents()
  }, [])

  const fetchPublicEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/events')
      const data = await response.json()
      if (data.data) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleEventAdded = async () => {
    await fetchPublicEvents()
    setShowAddEvent(false)
  }

  const handleViewDetails = (eventId) => {
    if (!token) {
      navigate('/login')
      return
    }
    navigate(`/evenimente/${eventId}`)
  }

  const isOrganizerOrAdmin = user?.is_organizer || user?.role === 'ADMIN'

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Evenimente</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Exploreaza evenimentele aprobate ale universității. Conecteaza-te pentru a vedea detalii complete și pentru a gestiona evenimentele tale organizate.
            </p>
          </div>
          {isOrganizerOrAdmin && (
            <button
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="self-start bg-usv-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {showAddEvent ? 'Anuleaza' : 'Adauga Eveniment'}
            </button>
          )}
        </div>

        {showAddEvent && isOrganizerOrAdmin && (
          <div className="mb-12">
            <AddEvent token={token} onEventAdded={handleEventAdded} />
          </div>
        )}

        <EventList events={events} onViewDetails={handleViewDetails} />
      </div>
    </main>
  )
}
