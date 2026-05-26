import { useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import EventDetails from '../components/EventDetails'

export default function EventDetailPage({ token }) {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="p-6 max-w-7xl mx-auto">
        <EventDetails eventId={id} token={token} onBack={() => navigate('/evenimente')} />
      </div>
    </main>
  )
}
