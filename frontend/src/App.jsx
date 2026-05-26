import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './utils/supabase'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import LoginPage from './pages/LoginPage'
import MyEvents from './pages/MyEvents'
import Profile from './pages/Profile'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const syncProfile = async (authUser, authToken, retry = 0) => {
    if (!authUser?.id) return null

    let profileData = null
    let fetchError = null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,full_name,email,role,is_organizer,department,faculty')
        .eq('id', authUser.id)
        .single()

      if (error) throw error
      profileData = data
    } catch (error) {
      fetchError = error
    }

    if ((!profileData || fetchError) && retry === 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return syncProfile(authUser, authToken, retry + 1)
    }

    if (!profileData && authToken) {
      try {
        const response = await fetch('http://localhost:8000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const json = await response.json()
          profileData = json.data
        }
      } catch (fallbackError) {
        console.error('Fallback profile fetch failed:', fallbackError)
      }
    }

    const mergedUser = {
      id: authUser.id,
      email: authUser.email,
      full_name: (profileData && profileData.full_name) || authUser.user_metadata?.full_name || authUser.email,
      role: (profileData && profileData.role) || 'Student',
      is_organizer: (profileData && profileData.is_organizer) || false,
      department: profileData?.department,
      faculty: profileData?.faculty,
    }

    setUser(mergedUser)
    return mergedUser
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session

      if (session) {
        setToken(session.access_token)
        await syncProfile(session.user)
      } else {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      }
    }

    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setToken(session.access_token)
        await syncProfile(session.user)
      } else {
        setToken(null)
        setUser(null)
      }
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token, user])

  const handleLogin = async (token, user) => {
    setToken(token)
    if (user?.id) {
      await syncProfile(user, token)
    } else {
      setUser(user)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/evenimente" element={<EventsPage token={token} user={user} onLogout={handleLogout} />} />
          <Route path="/evenimente/:id" element={<EventDetailPage token={token} />} />
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/my-events" element={token ? <MyEvents token={token} user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={token ? <Profile token={token} user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={token ? <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Settings</h1><p className="mt-4">Settings page coming soon...</p></div> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
