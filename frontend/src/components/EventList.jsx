import EventCard from './EventCard'

const sampleEvents = [
  {
    id: 1,
    title: 'Hackathon USV',
    short_description: 'A great hackathon event for students to collaborate, ideate, and build real projects.',
    date_start: '2026-05-20T09:00:00',
    category: 'academic',
    image_url: '',
  },
  {
    id: 2,
    title: 'Ziua Porților Deschise',
    short_description: 'Open day for prospective students with guided tours, talks, and community events.',
    date_start: '2026-06-02T11:00:00',
    category: 'sport',
    image_url: '',
  },
]

export default function EventList({ events = [], onViewDetails }) {
  const displayEvents = events.length > 0 ? events : sampleEvents

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" id="events">
      {displayEvents.map((event) => (
        <EventCard key={event.id} event={event} onViewDetails={onViewDetails} />
      ))}
    </div>
  )
}
