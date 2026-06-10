import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventList from '../components/EventList'
import AddEvent from '../components/AddEvent'

export default function EventsPage({ token, user }) {
  const [events, setEvents] = useState([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [sortBy, setSortBy] = useState('date') // 'date' or 'name'
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

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date_start) - new Date(b.date_start)
    } else if (sortBy === 'name') {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">evenimente</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Exploreaza evenimentele aprobate ale universității. Conecteaza-te pentru a vedea detalii complete și pentru a gestiona evenimentele tale organizate.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('date')}
                className={`px-4 py-2 rounded transition-colors ${
                  sortBy === 'date'
                    ? 'bg-usv-blue text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Sortare Dupa Data
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded transition-colors ${
                  sortBy === 'name'
                    ? 'bg-usv-blue text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Sortare Dupa Nume
              </button>
            </div>
            {isOrganizerOrAdmin && (
              <button
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="bg-usv-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {showAddEvent ? 'Anuleaza' : 'Adauga Eveniment'}
              </button>
            )}
          </div>
        </div>

        {showAddEvent && isOrganizerOrAdmin && (
          <div className="mb-12">
            <AddEvent token={token} onEventAdded={handleEventAdded} />
          </div>
        )}

        <EventList events={sortedEvents} onViewDetails={handleViewDetails} />
      </div>
    </main>
  )
}
