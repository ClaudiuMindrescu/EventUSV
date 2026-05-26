import { useNavigate } from 'react-router-dom'
import Login from '../components/Login'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()

  const handleLoginSuccess = (token, user) => {
    onLogin(token, user)
    navigate('/evenimente')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Login onLogin={handleLoginSuccess} />
      </div>
    </main>
  )
}
