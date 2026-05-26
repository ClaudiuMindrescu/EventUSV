import { Calendar } from 'lucide-react'

export default function EventCard({ event, onViewDetails }) {
  const eventDate = event.date_start
    ? new Date(event.date_start).toLocaleString('ro-RO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Program în curs de actualizare'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-usv-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-usv-blue">
            {event.category}
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">{event.title}</h2>
        <p className="text-sm text-slate-600 line-clamp-2">{event.short_description}</p>
      </div>
      <div className="mb-6 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <span>{eventDate}</span>
        </div>
      </div>
      <button
        onClick={() => onViewDetails?.(event.id)}
        className="w-full rounded-2xl bg-usv-blue px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Vezi Detalii
      </button>
    </article>
  )
}
