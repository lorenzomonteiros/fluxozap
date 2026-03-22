import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { useAuthStore } from './stores/authStore'
import { authService } from './services/auth.service'
import { getAccessToken } from './services/api'

// Pages
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Instances } from './pages/Instances'
import { Flows } from './pages/Flows'
import { FlowEditor } from './pages/FlowEditor'
import { Contacts } from './pages/Contacts'
import { Conversations } from './pages/Conversations'
import { Webhooks } from './pages/Webhooks'
import { Settings } from './pages/Settings'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !getAccessToken()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated && getAccessToken()) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function AppInitializer() {
  const { setUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && getAccessToken()) {
      authService.getMe().then(setUser).catch(() => {})
    }
  }, [isAuthenticated, setUser])

  return null
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppInitializer />
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>

        {/* App routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/flows/:id/edit" element={<FlowEditor />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
