import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import ErrorBoundary from './components/shared/ErrorBoundary'

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
import Users from './pages/admin/Users'
import ChatMonitoring from './pages/admin/ChatMonitoring'

// Client pages
import ClientHome from './pages/client/Home'
import MyAgents from './pages/client/MyAgents'
import AgentChat from './pages/client/AgentChat'
import AgentConfig from './pages/client/AgentConfig'
import Integrations from './pages/client/Integrations'
import ClientUsage from './pages/client/Usage'
import ClientBilling from './pages/client/Billing'
import ClientSettings from './pages/client/Settings'
import Support from './pages/client/Support'

// Partner pages
import PartnerHome from './pages/partner/Home'
import Referrals from './pages/partner/Referrals'
import Commissions from './pages/partner/Commissions'
import Payouts from './pages/partner/Payouts'
import Resources from './pages/partner/Resources'
import PartnerSettings from './pages/partner/Settings'

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
    <ErrorBoundary>
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
            <Route path="users" element={<Users />} />
            <Route path="chat-monitoring" element={<ChatMonitoring />} />
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
            <Route path="agents/:agentId/config" element={<AgentConfig />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="usage" element={<ClientUsage />} />
            <Route path="billing" element={<ClientBilling />} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="support" element={<Support />} />
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
            <Route index element={<PartnerHome />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="resources" element={<Resources />} />
            <Route path="settings" element={<PartnerSettings />} />
          </Route>

          {/* Root redirect based on role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* 404 - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
