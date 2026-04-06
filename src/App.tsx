import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import PartnerLayout from './layouts/PartnerLayout'

// Auth pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Clients from './pages/admin/Clients'
import ClientDetail from './pages/admin/ClientDetail'
import Agents from './pages/admin/Agents'
import AgentDetail from './pages/admin/AgentDetail'
import AdminUsage from './pages/admin/Usage'
import Partners from './pages/admin/Partners'
import PartnerDetail from './pages/admin/PartnerDetail'

// Client pages
import ClientHome from './pages/client/Home'
import MyAgents from './pages/client/MyAgents'
import AgentChat from './pages/client/AgentChat'
import ClientSettings from './pages/client/Settings'

// Helper component for role-based redirect
function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect based on user role
  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />
    case 'client':
      return <Navigate to="/dashboard" replace />
    case 'partner':
      return <Navigate to="/partners/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth routes (public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="agents" element={<Agents />} />
            <Route path="agents/:agentId" element={<AgentDetail />} />
            <Route path="usage" element={<AdminUsage />} />
            <Route path="partners" element={<Partners />} />
            <Route path="partners/:partnerId" element={<PartnerDetail />} />
          </Route>

          {/* Client routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientHome />} />
            <Route path="agents" element={<MyAgents />} />
            <Route path="agents/:agentId/chat" element={<AgentChat />} />
            <Route path="integrations" element={<div className="text-center text-2xl text-muted-foreground">Integrations - Coming Soon</div>} />
            <Route path="usage" element={<div className="text-center text-2xl text-muted-foreground">Usage & Billing - Coming Soon</div>} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="support" element={<div className="text-center text-2xl text-muted-foreground">Help & Support - Coming Soon</div>} />
          </Route>

          {/* Partner routes */}
          <Route
            path="/partners/dashboard"
            element={
              <ProtectedRoute allowedRoles={['partner']}>
                <PartnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="text-center text-2xl text-muted-foreground">Partner Dashboard - Coming Soon</div>} />
            <Route path="referrals" element={<div className="text-center text-2xl text-muted-foreground">My Referrals - Coming Soon</div>} />
            <Route path="commissions" element={<div className="text-center text-2xl text-muted-foreground">Commissions - Coming Soon</div>} />
            <Route path="payouts" element={<div className="text-center text-2xl text-muted-foreground">Payouts - Coming Soon</div>} />
            <Route path="resources" element={<div className="text-center text-2xl text-muted-foreground">Resources - Coming Soon</div>} />
            <Route path="settings" element={<div className="text-center text-2xl text-muted-foreground">Partner Settings - Coming Soon</div>} />
          </Route>

          {/* Root redirect based on role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* 404 - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
