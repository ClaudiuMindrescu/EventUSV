import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../utils/supabase'

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sat', 'Dum']
const MONTHS = [
  'Ianuarie',
  'Februarie',
  'Martie',
  'Aprilie',
  'Mai',
  'Iunie',
  'Iulie',
  'August',
  'Septembrie',
  'Octombrie',
  'Noiembrie',
  'Decembrie',
]

export default function Calendar({ token, user }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    if (token && user?.id) {
      fetchConfirmedEvents()
    }
  }, [token, user?.id])

  const fetchConfirmedEvents = async () => {
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
        setEvents([])
        return
      }

      const { data: eventRows, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)

      if (eventsError) throw eventsError

      setEvents(eventRows || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const getEventsForDate = (day) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date_start)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before month starts
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const monthName = MONTHS[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center text-slate-600">Se încarcă...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Calendar Evenimente</h1>
          <p className="text-slate-600">Vizualizează evenimentele la care ai confirmat participarea</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center min-w-48">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {monthName} {year}
                  </h2>
                </div>

                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Quick navigation */}
              <div className="flex justify-center p-4 border-b border-slate-200">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-usv-blue hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Azi
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-0 border-b border-slate-200">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="p-4 text-center font-semibold text-slate-600 text-sm border-r border-slate-200 last:border-r-0 bg-slate-50">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const isToday = day && new Date(year, currentDate.getMonth(), day).toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`min-h-32 p-2 border-r border-b border-slate-200 last:border-r-0 ${
                        !day ? 'bg-slate-50' : isToday ? 'bg-blue-50' : 'bg-white hover:bg-slate-50 transition-colors'
                      }`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-usv-blue' : 'text-slate-900'}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="block w-full text-left text-xs bg-usv-blue text-white rounded px-1.5 py-1 truncate hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                {event.title}
                              </button>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-slate-500 px-1.5 py-1">+{dayEvents.length - 2} mai mult</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Events list sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 sticky top-6">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Evenimente ({events.length})</h3>
              </div>

              <div className="max-h-96 overflow-y-auto p-4 space-y-2">
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500">Nu ai confirmat niciun eveniment</p>
                ) : (
                  events
                    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))
                    .map((event) => {
                      const eventDate = new Date(event.date_start)
                      const formattedDate = `${eventDate.getDate()} ${MONTHS[eventDate.getMonth()].substring(0, 3)}`

                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${
                            selectedEvent?.id === event.id
                              ? 'bg-usv-blue text-white'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className={selectedEvent?.id === event.id ? 'text-blue-100' : 'text-slate-500'}>
                            {formattedDate}
                          </div>
                        </button>
                      )
                    })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event details modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-slate-700">Data și ora</div>
                  <div className="text-slate-600">
                    {new Date(selectedEvent.date_start).toLocaleString('ro-RO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {selectedEvent.location && (
                  <div>
                    <div className="font-semibold text-slate-700">Locație</div>
                    <div className="text-slate-600">{selectedEvent.location}</div>
                  </div>
                )}

                {selectedEvent.short_description && (
                  <div>
                    <div className="font-semibold text-slate-700">Descriere</div>
                    <div className="text-slate-600">{selectedEvent.short_description}</div>
                  </div>
                )}

                {selectedEvent.category && (
                  <div>
                    <div className="font-semibold text-slate-700">Categorie</div>
                    <div className="text-slate-600 capitalize">{selectedEvent.category}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Închide
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
