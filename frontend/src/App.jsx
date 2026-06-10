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
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import Calendar from './pages/Calendar'
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
        .select('id,full_name,email,role,is_organizer,department_id,avatar_url')
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

    let departmentData = null
    if (profileData?.department_id) {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id,name,short_name')
          .eq('id', profileData.department_id)
          .single()

        if (error) throw error
        departmentData = data
      } catch (departmentError) {
        console.error('Department fetch failed:', departmentError)
      }
    }

    const mergedUser = {
      id: authUser.id,
      email: authUser.email,
      full_name: (profileData && profileData.full_name) || authUser.user_metadata?.full_name || authUser.email,
      role: ((profileData && profileData.role) || 'STUDENT').toUpperCase(),
      is_organizer: (profileData && profileData.is_organizer) || false,
      department_id: profileData?.department_id,
      department: departmentData,
      avatar_url: profileData?.avatar_url,
    }

    setUser(mergedUser)
    return mergedUser
  }

  const handleProfileUpdated = (profileData) => {
    if (!profileData) return

    setUser((currentUser) => ({
      ...currentUser,
      ...profileData,
      role: (profileData.role || currentUser?.role || 'STUDENT').toUpperCase(),
      department: profileData.department || currentUser?.department,
    }))
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
      return syncProfile(user, token)
    }

    setUser(user)
    return user
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'
  const requireUser = (element) => {
    if (!token) return <Navigate to="/login" replace />
    if (isAdmin) return <Navigate to="/admin" replace />
    return element
  }

  const publicUserRoute = (element) => {
    if (isAdmin) return <Navigate to="/admin" replace />
    return element
  }

  const requireAdmin = (element) => {
    if (!token) return <Navigate to="/login" replace />
    if (!isAdmin) return <Navigate to="/evenimente" replace />
    return element
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#070b1a] text-slate-100">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
          <Route
            path="/evenimente"
            element={publicUserRoute(<EventsPage token={token} user={user} onLogout={handleLogout} />)}
          />
          <Route path="/evenimente/:id" element={requireUser(<EventDetailPage token={token} user={user} />)} />
          <Route
            path="/login"
            element={token ? <Navigate to={isAdmin ? '/admin' : '/evenimente'} replace /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route path="/my-events" element={requireUser(<MyEvents token={token} user={user} />)} />
          <Route path="/calendar" element={requireUser(<Calendar token={token} user={user} />)} />
          <Route path="/profile" element={requireUser(<Profile token={token} user={user} />)} />
          <Route
            path="/settings"
            element={requireUser(<Settings user={user} onProfileUpdated={handleProfileUpdated} />)}
          />
          <Route path="/admin" element={requireAdmin(<AdminDashboard user={user} />)} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
